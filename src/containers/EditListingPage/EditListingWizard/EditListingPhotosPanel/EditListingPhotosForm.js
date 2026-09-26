import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ARRAY_ERROR } from 'final-form';
import { Form as FinalForm, Field } from 'react-final-form';
import arrayMutators from 'final-form-arrays';
import { FieldArray } from 'react-final-form-arrays';
import isEqual from 'lodash/isEqual';
import classNames from 'classnames';
import loadable from '@loadable/component';

// Import configs and util modules
import { useConfiguration } from '../../../../context/configurationContext';
import { FormattedMessage, useIntl } from '../../../../util/reactIntl';
import { propTypes } from '../../../../util/types';
import { nonEmptyArray, composeValidators } from '../../../../util/validators';
import { isUploadImageOverLimitError } from '../../../../util/errors';
import { shotListFor } from '../../../../util/fairwayGear';
import { listingImageIdentifierStrings } from '../../EditListingPage.shared';

// Import shared components
import { Button, Form, AspectRatioWrapper, NamedLink } from '../../../../components';

// Import modules from this directory
import ListingImage from './ListingImage';
import css from './EditListingPhotosForm.module.css';

const ACCEPT_IMAGES = 'image/*';

// Line icons; the class keeps the global svg fill from filling them in
const PlusIcon = () => (
  <svg className={css.lineIcon} width="22" height="22" viewBox="0 0 24 24" aria-hidden={true}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

const CameraIcon = () => (
  <svg className={css.lineIcon} width="20" height="20" viewBox="0 0 24 24" aria-hidden={true}>
    <path d="M4 8h3l2-3h6l2 3h3v11H4z" />
    <circle cx="12" cy="13" r="3.5" />
  </svg>
);

// Split out of the main bundle - only fetched once this form actually mounts.
const Sortable = loadable.lib(() => import(/* webpackChunkName: "sortablejs" */ 'sortablejs'));

// Attaches SortableJS to the FieldArray's container and reorders the images
// FieldArray via moveImageRef.current() on drag end
const SortableController = props => {
  const {
    sortableModule,
    containerRef,
    moveImageRef,
    onDragStateChange,
    onChooseStateChange,
  } = props;
  const { default: SortableLib } = sortableModule;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return undefined;
    }
    const sortable = SortableLib.create(container, {
      animation: 150,
      delay: 150,
      forceFallback: true,
      handle: '[data-drag-handle]',
      ghostClass: css.sortableGhost,
      chosenClass: css.sortableChosen,
      dragClass: css.sortableDrag,
      delayOnTouchOnly: true,
      onChoose: () => onChooseStateChange(true),
      onUnchoose: () => onChooseStateChange(false),
      onStart: () => onDragStateChange(true),
      onEnd: event => {
        onDragStateChange(false);
        const { oldIndex, newIndex } = event;
        if (oldIndex !== newIndex) {
          moveImageRef.current(oldIndex, newIndex);
        }
      },
    });
    return () => {
      sortable.destroy();
    };
  }, [SortableLib, containerRef, moveImageRef, onDragStateChange, onChooseStateChange]);

  return null;
};

const ImageUploadError = props => {
  return props.uploadOverLimit ? (
    <p className={css.error}>
      <FormattedMessage id="EditListingPhotosForm.imageUploadFailed.uploadOverLimit" />
    </p>
  ) : props.uploadImageError ? (
    <p className={css.error}>
      <FormattedMessage id="EditListingPhotosForm.imageUploadFailed.uploadFailed" />
    </p>
  ) : null;
};

// NOTE: PublishListingError and ShowListingsError are here since Photos panel is the last visible panel
// before creating a new listing. If that order is changed, these should be changed too.
// Create and show listing errors are shown above submit button
const PublishListingError = props => {
  return props.error ? (
    <p className={css.error}>
      <FormattedMessage id="EditListingPhotosForm.publishListingFailed" />
    </p>
  ) : null;
};

const ShowListingsError = props => {
  return props.error ? (
    <p className={css.error}>
      <FormattedMessage id="EditListingPhotosForm.showListingFailed" />
    </p>
  ) : null;
};

// Field component that uses file-input to allow user to select images.
export const FieldAddImage = props => {
  const {
    formApi,
    onImageUploadHandler,
    aspectWidth = 1,
    aspectHeight = 1,
    className,
    isChoosing,
    // 'environment' opens the rear camera straight away on a phone.
    // Desktop browsers ignore it and show the normal file picker.
    capture,
    multiple,
    labelClassName,
    ...rest
  } = props;
  return (
    <Field form={null} {...rest}>
      {fieldprops => {
        const { accept, input, label, disabled: fieldDisabled } = fieldprops;
        const { name, type } = input;
        // FAIRWAY: several photos in one go — picking six shots one at a time
        // on a phone was six trips through the photo library.
        const onChange = e => {
          const files = Array.from(e.target.files || []);
          if (files.length === 0) {
            return;
          }
          formApi.change(`addImage`, files[0]);
          formApi.blur(`addImage`);
          files.forEach(file => onImageUploadHandler(file));
        };
        // Cleared on every open, so the same photo can be picked again after
        // it was removed (otherwise the input sees no change)
        const onClick = e => {
          if (e.target.files?.length) {
            e.target.value = '';
          }
        };
        const captureMaybe = capture ? { capture } : {};
        const multipleMaybe = multiple ? { multiple: true } : {};
        const inputProps = {
          accept,
          id: name,
          name,
          onChange,
          onClick,
          type,
          ...captureMaybe,
          ...multipleMaybe,
        };
        return (
          <div className={classNames(css.addImageWrapper, className)}>
            <AspectRatioWrapper width={aspectWidth} height={aspectHeight}>
              {fieldDisabled ? null : <input {...inputProps} className={css.addImageInput} />}
              <label
                htmlFor={name}
                className={classNames(css.addImage, labelClassName, {
                  [css.grabbingCursor]: isChoosing,
                })}
              >
                {label}
              </label>
            </AspectRatioWrapper>
          </div>
        );
      }}
    </Field>
  );
};

// Component that shows listing images from "images" field array
const FieldListingImage = props => {
  const {
    name,
    index,
    count,
    intl,
    onRemoveImage,
    onMoveImage,
    disableMoveUp,
    disableMoveDown,
    hideMoveControls,
    pendingFocusDirection,
    onFocusRequestHandled,
    isCoverImage,
    isChoosing,
    aspectWidth,
    aspectHeight,
    variantPrefix,
  } = props;

  const currentPositionMessage = intl.formatMessage(
    { id: 'ListingImage.screenreader.currentPosition' },
    { index: index + 1, count }
  );

  return (
    <Field name={name}>
      {fieldProps => {
        const { input } = fieldProps;
        const image = input.value;
        return image ? (
          <ListingImage
            image={image}
            key={image?.id?.uuid || image?.id}
            className={css.thumbnail}
            savedImageAltText={intl.formatMessage({
              id: 'EditListingPhotosForm.savedImageAltText',
            })}
            onRemoveImage={() => onRemoveImage(image?.id)}
            onMoveUp={() => onMoveImage(index, index - 1)}
            onMoveDown={() => onMoveImage(index, index + 1)}
            disableMoveUp={disableMoveUp}
            disableMoveDown={disableMoveDown}
            hideMoveControls={hideMoveControls}
            pendingFocusDirection={pendingFocusDirection}
            onFocusRequestHandled={onFocusRequestHandled}
            isCoverImage={isCoverImage}
            isChoosing={isChoosing}
            currentPositionMessage={currentPositionMessage}
            aspectWidth={aspectWidth}
            aspectHeight={aspectHeight}
            variantPrefix={variantPrefix}
          />
        ) : null;
      }}
    </Field>
  );
};

/**
 * The EditListingPhotosForm component.
 *
 * @component
 * @param {Object} props
 * @param {string} [props.className] - Custom class that extends the default class for the root element
 * @param {string} [props.rootClassName] - Custom class that overrides the default class for the root element
 * @param {boolean} props.disabled - Whether the form is disabled
 * @param {boolean} props.ready - Whether the form is ready
 * @param {boolean} props.updated - Whether the form is updated
 * @param {boolean} props.updateInProgress - Whether the update is in progress
 * @param {Object} props.fetchErrors - The fetch errors object
 * @param {propTypes.error} props.fetchErrors.publishListingError - The publish listing error
 * @param {propTypes.error} props.fetchErrors.showListingsError - The show listings error
 * @param {propTypes.error} props.fetchErrors.uploadImageError - The upload image error
 * @param {propTypes.error} props.fetchErrors.updateListingError - The update listing error
 * @param {string} props.saveActionMsg - The save action message
 * @param {Function} props.onSubmit - The submit function
 * @param {Function} props.onImageUpload - The image upload function
 * @param {Function} props.onRemoveImage - The remove image function
 * @param {Object} props.listingImageConfig - The listing image config
 * @param {number} props.listingImageConfig.aspectWidth - The aspect width
 * @param {number} props.listingImageConfig.aspectHeight - The aspect height
 * @param {string} props.listingImageConfig.variantPrefix - The variant prefix
 * @returns {JSX.Element}
 */
export const EditListingPhotosForm = props => {
  // FAIRWAY: how many photos are still uploading — several can be on their way at once
  const [uploadsInFlight, setUploadsInFlight] = useState(0);
  const [submittedImages, setSubmittedImages] = useState([]);

  // Determins which image (by new index) and direction should get focus after an arrow move.
  const [focusRequest, setFocusRequest] = useState(null);
  const clearFocusRequest = useCallback(() => setFocusRequest(null), []);

  const sortableContainerRef = useRef(null);
  // Always points at the latest move function, so the Sortable instance
  // (created once it mounts) never calls a stale closure.
  const moveImageRef = useRef(() => {});
  // Monitor dragging state to prevent pointer-events on add photo tile
  const [isDragging, setIsDragging] = useState(false);
  // Monitor choosing state to update pointer UI
  const [isChoosing, setIsChoosing] = useState(false);
  // Points at the current FinalForm API so uploads can be synced in from
  // an effect (below), outside of the FinalForm render callback.
  const formApiRef = useRef(null);

  // keepDirtyOnReinitialize freezes images once dirty, so new uploads via
  // initialValues get dropped after a reorder/removal - push them in directly.
  const syncImagesFromProps = useCallback(() => {
    const form = formApiRef.current;
    const propsImages = props.initialValues?.images || [];
    if (!form || propsImages.length === 0) {
      return;
    }
    propsImages.forEach(image => {
      const currentImages = form.getState().values.images || [];
      const ids = listingImageIdentifierStrings(image);
      // Find index of this image in the form's current images if it exists
      const index = currentImages.findIndex(existing =>
        listingImageIdentifierStrings(existing).some(id => ids.includes(id))
      );
      if (index === -1) {
        // New upload, not in the form yet
        form.mutators.push('images', image);
      } else if (!isEqual(currentImages[index], image)) {
        // Already in the form, but stale (e.g. upload just finished)
        form.mutators.update('images', index, image);
      }
    });
  }, [props.initialValues.images]);

  useEffect(() => {
    syncImagesFromProps();
  }, [syncImagesFromProps]);

  const onImageUploadHandler = file => {
    const { listingImageConfig, onImageUpload } = props;
    if (file) {
      setUploadsInFlight(n => n + 1);
      const done = () => setUploadsInFlight(n => Math.max(0, n - 1));
      // Unique even for several files picked in the same millisecond
      const id = `${file.name}_${Date.now()}_${Math.random()
        .toString(36)
        .slice(2, 8)}`;
      onImageUpload({ id, file }, listingImageConfig).then(done, done);
    }
  };
  const intl = useIntl();
  const config = useConfiguration();

  return (
    <FinalForm
      {...props}
      // Without this, reordering gets silently reverted when initialValues
      // recomputes (e.g. another photo finishing upload). Applies to the whole
      // form, not just "images" - a future field here inherits this too.
      keepDirtyOnReinitialize
      mutators={{ ...arrayMutators }}
      render={formRenderProps => {
        const {
          form,
          className,
          fetchErrors,
          handleSubmit,
          invalid,
          onRemoveImage,
          disabled,
          ready,
          saveActionMsg,
          updated,
          updateInProgress,
          touched,
          errors,
          values,
          listingImageConfig,
          allFilesUploadedAndVerified,
          filesTabParams,
          filesRequired,
          categoryId,
        } = formRenderProps;

        formApiRef.current = form;

        const images = values.images || [];
        const { aspectWidth = 1, aspectHeight = 1, variantPrefix } = listingImageConfig;

        const { publishListingError, showListingsError, updateListingError, uploadImageError } =
          fetchErrors || {};
        const uploadOverLimit = isUploadImageOverLimitError(uploadImageError);

        // imgs can contain added images (with temp ids) and submitted images with uniq ids.
        const arrayOfImgIds = imgs => imgs?.map(i => (typeof i.id === 'string' ? i.imageId : i.id));
        const imageIdsFromProps = arrayOfImgIds(images);
        const imageIdsFromPreviousSubmit = arrayOfImgIds(submittedImages);
        const imageArrayHasSameImages = isEqual(imageIdsFromProps, imageIdsFromPreviousSubmit);
        const submittedOnce = submittedImages.length > 0;
        const pristineSinceLastSubmit = submittedOnce && imageArrayHasSameImages;

        const submitReady = (updated && pristineSinceLastSubmit) || ready;
        const submitInProgress = updateInProgress;
        // FAIRWAY: a listing needs three photos before the seller can move on.
        // The count is named in the message so it is never a generic "something
        // is missing".
        const minImages = config.listing.minListingImages || 3;
        const hasEnoughImages = images.length >= minImages;

        // FAIRWAY: the shot list for this kind of gear. The slots after the
        // photos already added name the ones still to take.
        const shots = shotListFor(categoryId);
        const nextShot = shots[images.length];
        const laterShots = shots.slice(images.length + 1);
        const shotLabel = id => intl.formatMessage({ id: `EditListingPhotosForm.shot.${id}` });
        const openPicker = () => document.getElementById('addImage')?.click();

        const submitDisabled =
          invalid ||
          disabled ||
          submitInProgress ||
          uploadsInFlight > 0 ||
          ready ||
          !hasEnoughImages;
        const imagesError = touched.images && errors?.images && errors.images[ARRAY_ERROR];

        const classes = classNames(css.root, className);

        return (
          <Form
            className={classes}
            onSubmit={e => {
              setSubmittedImages(images);
              handleSubmit(e);
            }}
          >
            {updateListingError ? (
              <p className={css.error}>
                <FormattedMessage id="EditListingPhotosForm.updateFailed" />
              </p>
            ) : null}

            {/* FAIRWAY: how far along the photos are — instead of a red error
                before the seller has even started */}
            <div className={css.progress} aria-live="polite">
              <div className={css.progressRow}>
                <span className={css.progressCount}>
                  <FormattedMessage
                    id={
                      hasEnoughImages
                        ? 'EditListingPhotosForm.progressCountDone'
                        : 'EditListingPhotosForm.progressCount'
                    }
                    values={{ count: images.length, min: minImages }}
                  />
                </span>
                <span className={hasEnoughImages ? css.progressDone : css.progressMissing}>
                  {hasEnoughImages ? (
                    <FormattedMessage id="EditListingPhotosForm.progressDone" />
                  ) : (
                    <FormattedMessage
                      id="EditListingPhotosForm.progressMissing"
                      values={{ remaining: minImages - images.length }}
                    />
                  )}
                </span>
              </div>
              <div className={css.progressTrack}>
                <span
                  className={classNames(css.progressFill, {
                    [css.progressFillDone]: hasEnoughImages,
                  })}
                  style={{ width: `${Math.min(100, (images.length / minImages) * 100)}%` }}
                />
              </div>
            </div>

            <div className={classNames(css.imagesFieldArray, { [css.grabbingCursor]: isChoosing })}>
              <FieldArray
                name="images"
                validate={composeValidators(
                  nonEmptyArray(
                    intl.formatMessage({
                      id: 'EditListingPhotosForm.imageRequired',
                    })
                  )
                )}
              >
                {({ fields }) => {
                  // Bounds-checked move, shared by both arrows and Sortable's drag.
                  const moveImage = (fromIndex, toIndex) => {
                    if (toIndex < 0 || toIndex >= fields.length) {
                      return false;
                    }
                    fields.move(fromIndex, toIndex);
                    return true;
                  };
                  moveImageRef.current = moveImage;

                  return (
                    <div className={css.sortableImages} ref={sortableContainerRef}>
                      {fields.map((name, index) => (
                        <FieldListingImage
                          key={name}
                          name={name}
                          index={index}
                          count={fields.length}
                          disableMoveUp={index === 0}
                          disableMoveDown={index === fields.length - 1}
                          hideMoveControls={fields.length === 1}
                          isCoverImage={index === 0}
                          isChoosing={isChoosing}
                          onRemoveImage={imageId => {
                            fields.remove(index);
                            onRemoveImage(imageId);
                          }}
                          onMoveImage={(fromIndex, toIndex) => {
                            // Only arrows request focus-follow; drag skips this.
                            if (moveImage(fromIndex, toIndex)) {
                              setFocusRequest({
                                index: toIndex,
                                direction: toIndex < fromIndex ? 'up' : 'down',
                              });
                            }
                          }}
                          pendingFocusDirection={
                            focusRequest?.index === index ? focusRequest.direction : null
                          }
                          onFocusRequestHandled={clearFocusRequest}
                          intl={intl}
                          aspectWidth={aspectWidth}
                          aspectHeight={aspectHeight}
                          variantPrefix={variantPrefix}
                        />
                      ))}
                    </div>
                  );
                }}
              </FieldArray>

              {images.length > 1 ? (
                <Sortable>
                  {sortableModule => (
                    <SortableController
                      sortableModule={sortableModule}
                      containerRef={sortableContainerRef}
                      moveImageRef={moveImageRef}
                      onDragStateChange={setIsDragging}
                      onChooseStateChange={setIsChoosing}
                    />
                  )}
                </Sortable>
              ) : null}

              {/* FAIRWAY: the next photo to take, named — and after it the rest
                  of the shot list as empty slots, so "good photos" is a list
                  to work down rather than a guess */}
              <FieldAddImage
                id="addImage"
                name="addImage"
                accept={ACCEPT_IMAGES}
                multiple
                className={classNames(css.slotTile, {
                  [css.addImageWrapperDragging]: isDragging,
                  [css.slotCover]: images.length === 0,
                })}
                labelClassName={css.slotActive}
                isChoosing={isChoosing}
                label={
                  <span className={css.slotContent}>
                    <span className={css.slotPlus} aria-hidden={true}>
                      <PlusIcon />
                    </span>
                    <span className={css.slotTitle}>
                      {nextShot ? (
                        <FormattedMessage
                          id="EditListingPhotosForm.nextShot"
                          values={{ number: images.length + 1, shot: shotLabel(nextShot) }}
                        />
                      ) : (
                        <FormattedMessage id="EditListingPhotosForm.addMore" />
                      )}
                    </span>
                    <span className={css.slotHint}>
                      <FormattedMessage id="EditListingPhotosForm.chooseImages" />
                    </span>
                  </span>
                }
                type="file"
                formApi={form}
                onImageUploadHandler={onImageUploadHandler}
                aspectWidth={aspectWidth}
                aspectHeight={aspectHeight}
              />
              {laterShots.map((shot, i) => (
                <div
                  key={shot}
                  className={classNames(css.slotTile, {
                    [css.addImageWrapperDragging]: isDragging,
                  })}
                  aria-hidden={true}
                  onClick={openPicker}
                >
                  <AspectRatioWrapper width={aspectWidth} height={aspectHeight}>
                    <span className={css.slotGhost}>
                      <span className={css.slotNumber}>{images.length + 2 + i}</span>
                      <span className={css.slotGhostTitle}>{shotLabel(shot)}</span>
                    </span>
                  </AspectRatioWrapper>
                </div>
              ))}
            </div>

            {/* Shown only on touch devices: shoot the photo where the club is */}
            <div className={css.captureRow}>
              <input
                id="captureImage"
                name="captureImage"
                type="file"
                accept={ACCEPT_IMAGES}
                capture="environment"
                className={css.addImageInput}
                onClick={e => {
                  if (e.target.files?.length) {
                    e.target.value = '';
                  }
                }}
                onChange={e =>
                  Array.from(e.target.files || []).forEach(f => onImageUploadHandler(f))
                }
              />
              <label htmlFor="captureImage" className={css.captureButton}>
                <CameraIcon />
                <FormattedMessage id="EditListingPhotosForm.captureImage" />
              </label>
            </div>

            {imagesError ? <div className={css.arrayError}>{imagesError}</div> : null}

            <ImageUploadError
              uploadOverLimit={uploadOverLimit}
              uploadImageError={uploadImageError}
            />

            <p className={css.tip}>
              <FormattedMessage id="EditListingPhotosForm.addImagesTip" />
            </p>

            <div className={css.submitSection}>
              <PublishListingError error={publishListingError} />
              <ShowListingsError error={showListingsError} />

              {filesRequired && !allFilesUploadedAndVerified ? (
                <p className={css.filesNotReady}>
                  <FormattedMessage
                    id="EditListingPhotosForm.filesNotReady"
                    values={{
                      filesTabLink: (
                        <NamedLink name="EditListingPage" params={filesTabParams}>
                          <FormattedMessage id="EditListingPhotosForm.filesTabLinkText" />
                        </NamedLink>
                      ),
                    }}
                  />
                </p>
              ) : null}

              <Button
                className={css.submitButton}
                type="submit"
                inProgress={submitInProgress}
                disabled={submitDisabled}
                ready={submitReady}
              >
                {saveActionMsg}
              </Button>
            </div>
          </Form>
        );
      }}
    />
  );
};

export default EditListingPhotosForm;
