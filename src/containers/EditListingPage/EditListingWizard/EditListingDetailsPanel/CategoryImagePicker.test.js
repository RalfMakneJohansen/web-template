import React from 'react';
import '@testing-library/jest-dom';
import { Form as FinalForm } from 'react-final-form';

import { renderWithProviders as render, testingLibrary } from '../../../../util/testHelpers';

import CategoryImagePicker, { canUseImagePicker } from './CategoryImagePicker';

const { screen, userEvent } = testingLibrary;

const GOLF = [
  { name: 'Driver', id: 'driver', subcategories: [] },
  { name: 'Fairway wood', id: 'fairway-wood', subcategories: [] },
  { name: 'Hybrid', id: 'hybrid', subcategories: [] },
  { name: 'Jernsæt', id: 'jernsaet', subcategories: [] },
  { name: 'Wedge', id: 'wedge', subcategories: [] },
  { name: 'Putter', id: 'putter', subcategories: [] },
  { name: 'Bag', id: 'bag', subcategories: [] },
  { name: 'Sko', id: 'sko', subcategories: [] },
  { name: 'Andet', id: 'andet', subcategories: [] },
];

const intl = { formatMessage: ({ id }) => id };

const renderPicker = (onChange = () => {}) =>
  render(
    <FinalForm
      onSubmit={() => {}}
      render={() => (
        <CategoryImagePicker
          name="categoryLevel1"
          categories={GOLF}
          intl={intl}
          onChange={onChange}
        />
      )}
    />
  );

describe('canUseImagePicker', () => {
  it('accepts the flat golf categories', () => {
    expect(canUseImagePicker(GOLF)).toBe(true);
  });

  it('refuses a nested set — a grid cannot show that something has children', () => {
    const nested = [{ name: 'Dogs', id: 'dogs', subcategories: [{ name: 'Poodles', id: 'p' }] }];
    expect(canUseImagePicker(nested)).toBe(false);
  });

  it('refuses a category it has no picture for, rather than drawing an empty disc', () => {
    expect(canUseImagePicker([{ name: 'Trolley', id: 'trolley', subcategories: [] }])).toBe(false);
  });

  it('refuses an empty or missing set', () => {
    expect(canUseImagePicker([])).toBe(false);
    expect(canUseImagePicker(undefined)).toBe(false);
  });
});

describe('CategoryImagePicker', () => {
  it('shows every category with a picture', () => {
    const { container } = renderPicker();

    GOLF.forEach(c => expect(screen.getByText(c.name)).toBeInTheDocument());
    expect(container.querySelectorAll('img')).toHaveLength(GOLF.length);
  });

  it('marks the chosen one as pressed and reports it', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    renderPicker(onChange);

    const driver = screen.getByText('Driver').closest('button');
    expect(driver).toHaveAttribute('aria-pressed', 'false');

    await user.click(driver);

    expect(onChange).toHaveBeenCalledWith('driver');
    expect(driver).toHaveAttribute('aria-pressed', 'true');
  });

  it('moves the selection rather than adding to it', async () => {
    const user = userEvent.setup();
    renderPicker();

    const driver = screen.getByText('Driver').closest('button');
    const putter = screen.getByText('Putter').closest('button');

    await user.click(driver);
    await user.click(putter);

    expect(driver).toHaveAttribute('aria-pressed', 'false');
    expect(putter).toHaveAttribute('aria-pressed', 'true');
  });

  it('leaves the photographs out of the accessibility tree — the name is the label', () => {
    const { container } = renderPicker();
    container.querySelectorAll('img').forEach(img => expect(img).toHaveAttribute('alt', ''));
  });
});
