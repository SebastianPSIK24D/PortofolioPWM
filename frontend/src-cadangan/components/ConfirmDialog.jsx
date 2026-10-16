// frontend/src/components/ConfirmDialog.jsx
import Modal from './Modal';
import Button from './Button';

const ConfirmDialog = ({
  isOpen,
  title = 'Hapus data?',
  message,
  confirmText = 'Ya, Hapus',
  onConfirm,
  onCancel,
  isLoading = false,
}) => (
  <Modal isOpen={isOpen} onClose={onCancel} title={title} isLoading={isLoading} loadingTitle="Menghapus...">
    <p className="confirm-text">{message}</p>
    <div className="form-actions">
      <Button type="button" primary={false} text="Batal" onClick={onCancel} disabled={isLoading} />
      <Button type="button" primary={false} className="danger" text={confirmText} onClick={onConfirm} disabled={isLoading} />
    </div>
  </Modal>
);

export default ConfirmDialog;