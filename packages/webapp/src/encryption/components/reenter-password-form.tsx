import { generateEncryptionKey, onError, useFormFields } from "_app";
import { Button, Form, Heading, Text } from "_app/ui";

interface Props {
    expectedPublicKey: string;
    isLoading?: boolean;
    onSubmit: (publicKey: string, privateKey: string) => void;
    onCancel: () => void;
    onForgotPassword: () => void;
}

export const ReenterPasswordForm = ({
    expectedPublicKey,
    isLoading,
    onSubmit,
    onCancel,
    onForgotPassword,
}: Props) => {
    const [fields, setFields] = useFormFields({
        password: "",
    });
    const onChangeFields = (e: React.ChangeEvent<HTMLInputElement>) =>
        setFields(e);

    const doSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const generatedKey = generateEncryptionKey(fields.password);
            if (generatedKey.publicKey.toLegacyString() !== expectedPublicKey) {
                onError(new Error("The entered password is not correct"));
                return;
            }
            onSubmit(
                generatedKey.publicKey.toLegacyString(),
                generatedKey.privateKey.toLegacyString()
            );
        } catch (error) {
            console.error(error);
            onError(error);
        }
    };

    return (
        <div className="space-y-4">
            <Heading>請輸入競選密碼</Heading>
            <Text>
                輸入競選密碼，以便在即將舉行的選舉中解鎖你的視頻會議鏈接。
            </Text>
            <form onSubmit={doSubmit} className="space-y-3">
                <Form.LabeledSet
                    label="Your Election Password"
                    htmlFor="password"
                    className="col-span-6 sm:col-span-3"
                >
                    <Form.Input
                        id="password"
                        type="password"
                        autoComplete="current-password"
                        required
                        value={fields.password}
                        disabled={isLoading}
                        onChange={onChangeFields}
                    />
                    <Button
                        type="link"
                        onClick={onForgotPassword}
                        className="pl-0 pr-0"
                    >
                        忘記密碼
                    </Button>
                </Form.LabeledSet>
                <div className="flex space-x-3">
                    <Button type="neutral" onClick={onCancel}>
                        取消
                    </Button>
                    <Button
                        isSubmit
                        disabled={!fields.password || isLoading}
                        isLoading={isLoading}
                    >
                        確定
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default ReenterPasswordForm;
