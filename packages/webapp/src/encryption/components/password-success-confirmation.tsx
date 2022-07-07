import { Button, Heading, Text } from "_app/ui";

interface Props {
    onDismiss: () => void;
}

export const PasswordSuccessConfirmation = ({ onDismiss }: Props) => {
    return (
        <div className="space-y-4">
            <Heading>成功!</Heading>
            <Text>您的密碼設置好了.</Text>
            <div className="flex space-x-3">
                <Button onClick={onDismiss}>OK</Button>
            </div>
        </div>
    );
};

export default PasswordSuccessConfirmation;
