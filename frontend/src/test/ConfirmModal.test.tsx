import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ConfirmModal from '../components/ConfirmModal';

describe('ConfirmModal', () => {
  it('renders nothing when open is false', () => {
    const { container } = render(
      <ConfirmModal
        open={false}
        title="Test"
        message="Test message"
        onConfirm={() => {}}
        onCancel={() => {}}
      />
    );
    expect(container.innerHTML).toBe('');
  });

  it('renders title and message when open is true', () => {
    render(
      <ConfirmModal
        open={true}
        title="Delete Item"
        message="Are you sure you want to delete this item?"
        onConfirm={() => {}}
        onCancel={() => {}}
      />
    );
    expect(screen.getByText('Delete Item')).toBeDefined();
    expect(screen.getByText('Are you sure you want to delete this item?')).toBeDefined();
  });

  it('shows default confirm and cancel labels', () => {
    render(
      <ConfirmModal
        open={true}
        title="Test"
        message="Test message"
        onConfirm={() => {}}
        onCancel={() => {}}
      />
    );
    const buttons = screen.getAllByRole('button');
    const labels = buttons.map(b => b.textContent);
    expect(labels).toContain('Delete');
    expect(labels).toContain('Cancel');
  });

  it('shows custom button labels when provided', () => {
    render(
      <ConfirmModal
        open={true}
        title="Test"
        message="Test message"
        confirmLabel="Yes, remove"
        cancelLabel="No, keep"
        onConfirm={() => {}}
        onCancel={() => {}}
      />
    );
    expect(screen.getByText('Yes, remove')).toBeDefined();
    expect(screen.getByText('No, keep')).toBeDefined();
  });

  it('calls onConfirm when confirm button is clicked', () => {
    const onConfirm = vi.fn();
    render(
      <ConfirmModal
        open={true}
        title="Confirm"
        message="Test message"
        onConfirm={onConfirm}
        onCancel={() => {}}
      />
    );
    fireEvent.click(screen.getByText('Delete'));
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it('calls onCancel when cancel button is clicked', () => {
    const onCancel = vi.fn();
    render(
      <ConfirmModal
        open={true}
        title="Test"
        message="Test message"
        onConfirm={() => {}}
        onCancel={onCancel}
      />
    );
    fireEvent.click(screen.getByText('Cancel'));
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('calls onCancel when backdrop is clicked', () => {
    const onCancel = vi.fn();
    const { container } = render(
      <ConfirmModal
        open={true}
        title="Test"
        message="Test message"
        onConfirm={() => {}}
        onCancel={onCancel}
      />
    );
    // The backdrop is the div with both absolute+inset classes
    const backdrop = container.querySelector('.absolute.inset-0');
    expect(backdrop).not.toBeNull();
    if (backdrop) {
      fireEvent.click(backdrop);
      expect(onCancel).toHaveBeenCalledOnce();
    }
  });

  it('calls onCancel when close (X) button is clicked', () => {
    const onCancel = vi.fn();
    render(
      <ConfirmModal
        open={true}
        title="Test"
        message="Test message"
        onConfirm={() => {}}
        onCancel={onCancel}
      />
    );
    const buttons = screen.getAllByRole('button');
    // First button is the X close button
    fireEvent.click(buttons[0]);
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('applies danger variant styling', () => {
    render(
      <ConfirmModal
        open={true}
        title="Confirm"
        message="Sure?"
        variant="danger"
        onConfirm={() => {}}
        onCancel={() => {}}
      />
    );
    const confirmBtn = screen.getByRole('button', { name: 'Delete' });
    expect(confirmBtn.className).toContain('btn-danger');
  });

  it('applies default variant styling', () => {
    render(
      <ConfirmModal
        open={true}
        title="Info"
        message="OK?"
        variant="default"
        onConfirm={() => {}}
        onCancel={() => {}}
      />
    );
    const confirmBtn = screen.getByRole('button', { name: 'Delete' });
    expect(confirmBtn.className).toContain('btn-primary');
  });
});
