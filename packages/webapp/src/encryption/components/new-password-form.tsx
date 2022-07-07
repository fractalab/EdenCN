import { useState } from "react";
import { PrivateKey } from "eosjs/dist/eosjs-key-conversions";
import { IoMdCopy } from "react-icons/io";
import secureRandomPassword from "secure-random-password";

import { generateEncryptionKey, onError, useFormFields } from "_app";
import { Button, Form, Heading, Text } from "_app/ui";
import { usePasswordModal } from "encryption/hooks";

interface Props {
    isLoading?: boolean;
    forgotPassword?: boolean;
    onSubmit: (publicKey: string, privateKey: string) => Promise<void>;
    onCancel: () => void;
}

const PASSWORD_OPTIONS = {
    length: 12,
    characters: [
        secureRandomPassword.lower,
        secureRandomPassword.upper,
        secureRandomPassword.symbols,
        secureRandomPassword.digits,
    ],
};

export const NewPasswordForm = ({
    forgotPassword,
    isLoading,
    onSubmit,
    onCancel,
}: Props) => {
    const [didCopyText, setDidCopyText] = useState<boolean>(false);
    const { newPasswordIsInvalidForCurrentRound } = usePasswordModal();
    const [fields, setFields] = useFormFields({
        password: secureRandomPassword.randomPassword(PASSWORD_OPTIONS),
        passwordConfirmation: "",
    });
    const onChangeFields = (e: React.ChangeEvent<HTMLInputElement>) =>
        setFields(e);

    const doSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (fields.password !== fields.passwordConfirmation) {
            onError(new Error("Password confirmation does not match."));
            return;
        }

        try {
            const generatedKey = generateEncryptionKey(fields.password);
            await onSubmit(
                generatedKey.publicKey.toLegacyString(),
                generatedKey.privateKey.toLegacyString()
            );
        } catch (error) {
            console.error(error);
            onError(error);
        }
    };

    const copyPassword = () => {
        navigator.clipboard.writeText(fields.password);
        setDidCopyText(true);
    };

    const forgotPasswordText =
        "If you have forgotten or lost your election password, you can replace it with a new one.";
    const createNewPasswordText =
        "你似乎還沒有設定競選密碼。";
    const text = forgotPassword ? forgotPasswordText : createNewPasswordText;

    return (
        <div className="space-y-4">
            <Heading className="mb-2.5">
                {forgotPassword
                    ? "Get new election password"
                    : "競選密碼"}
            </Heading>
            <Text>{text}</Text>
            {newPasswordIsInvalidForCurrentRound && (
                <Text>
                    <span className="font-semibold">IMPORTANT:</span> Your new
                    password will not work for the current election round
                    already underway; only{" "}
                    <span className="italic">future</span> rounds. For this
                    round, reach out to others in your group via Telegram or
                    otherwise to ask for the meeting link.
                </Text>
            )}
            <Text>
                請複製你的密碼并將其保存在安全的地方，並在下方確認你的密碼。
            </Text>
            <form onSubmit={doSubmit} className="space-y-3">
                <Form.LabeledSet
                    label="你的競選密碼"
                    htmlFor="password"
                    className="col-span-6 sm:col-span-3"
                >
                    <div className="flex space-x-2">
                        <Form.Input
                            id="password"
                            type="text"
                            disabled
                            required
                            value={fields.password}
                            onChange={onChangeFields}
                        />
                        <Button onClick={copyPassword}>
                            {didCopyText ? (
                                "Copied!"
                            ) : (
                                <IoMdCopy
                                    color="white"
                                    size={22}
                                    className="-mx-2"
                                />
                            )}
                        </Button>
                    </div>
                </Form.LabeledSet>
                <Form.LabeledSet
                    label="確認你的競選密碼"
                    htmlFor="passwordConfirmation"
                    className="col-span-6 sm:col-span-3"
                >
                    <Form.Input
                        id="passwordConfirmation"
                        type="password"
                        required
                        autoComplete="new-password"
                        value={fields.passwordConfirmation}
                        onChange={onChangeFields}
                    />
                </Form.LabeledSet>
                <div className="flex space-x-3">
                    <Button
                        type="neutral"
                        onClick={onCancel}
                        disabled={isLoading}
                    >
                        取消
                    </Button>
                    <Button
                        isSubmit
                        isLoading={isLoading}
                        disabled={!fields.passwordConfirmation || isLoading}
                    >
                        {isLoading ? "提交中..." : "確定"}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default NewPasswordForm;
