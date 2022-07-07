import { useState } from "react";
import ReactModal from "react-modal";

import { Modal } from "_app/ui";
import { useEncryptionPassword } from "encryption";

import CreateNewPasswordPrompt from "./create-new-password-prompt";

interface Props {
    close: () => void;
    isOpen: boolean;
    onAfterOpen?: () => void;
    onAfterClose?: () => void;
    onDismissConfirmation: () => void;
}

/**
 * This modal will only open if `isOpen` is `true` and password is not set on users account
 */
export const PromptCreateKeyModal = ({
    close,
    isOpen,
    onAfterClose,
    onAfterOpen,
    onDismissConfirmation,
    ...props
}: Props & ReactModal.Props) => {
    const { isPasswordNotSet } = useEncryptionPassword();

    // keeps the modal open even after the isPasswordNotSet condition updates on success
    // this ensures the modal remains open to show the user the success message
    const [isCreatingPassword, setIsCreatingPassword] = useState(false);

    const onAfterOpenHandler = () => {
        setIsCreatingPassword(true);
        onAfterOpen?.();
    };

    const onCloseHandler = () => {
        setIsCreatingPassword(false);
        close();
    };

    const onSuccessDismissHandler = () => {
        setIsCreatingPassword(false);
        onDismissConfirmation();
    };

    return (
        <Modal
            isOpen={isOpen && (isPasswordNotSet || isCreatingPassword)}
            onAfterClose={onAfterClose}
            onAfterOpen={onAfterOpenHandler}
            onRequestClose={onCloseHandler}
            contentLabel="Meeting Link Activation Modal - Requesting Password"
            preventScroll
            shouldCloseOnOverlayClick={false}
            shouldCloseOnEsc={false}
            {...props}
        >
            <CreateNewPasswordPrompt
                onCancel={onCloseHandler}
                onDismissConfirmation={onSuccessDismissHandler}
            />
        </Modal>
    );
};

export default PromptCreateKeyModal;
