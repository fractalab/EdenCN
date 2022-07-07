import { FormEvent, useState } from "react";

import { useFormFields, Form, Button } from "_app";

interface Props {
    onSubmit: (data: InitInductionFormData) => Promise<void>;
}

export interface InitInductionFormData {
    invitee: string;
    witness1: string;
    witness2: string;
}

const initialForm: InitInductionFormData = {
    invitee: "",
    witness1: "",
    witness2: "",
};

export const InductionInviteForm = ({ onSubmit }: Props) => {
    const [isLoading, setIsLoading] = useState(false);

    const [fields, setFields] = useFormFields({ ...initialForm });
    const onChangeFields = (e: React.ChangeEvent<HTMLInputElement>) =>
        setFields(e);

    const submitTransaction = async (e: FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        await onSubmit(fields);
        setIsLoading(false);
    };

    return (
        <form onSubmit={submitTransaction} className="space-y-3">
            <Form.LabeledSet
                label="被邀請人 EOS 賬號"
                htmlFor="invitee"
                className="col-span-6 sm:col-span-3"
            >
                <Form.Input
                    id="invitee"
                    type="text"
                    required
                    disabled={isLoading}
                    value={fields.invitee}
                    onChange={onChangeFields}
                />
            </Form.LabeledSet>
            <Form.LabeledSet
                label="1 號見證人 EOS 賬號"
                htmlFor="witness1"
                className="col-span-6 sm:col-span-3"
            >
                <Form.Input
                    id="witness1"
                    type="text"
                    required
                    disabled={isLoading}
                    value={fields.witness1}
                    onChange={onChangeFields}
                />
            </Form.LabeledSet>
            <Form.LabeledSet
                label="2 號見證人 EOS 賬號"
                htmlFor="witness2"
                className="col-span-6 sm:col-span-3"
            >
                <Form.Input
                    id="witness2"
                    type="text"
                    required
                    disabled={isLoading}
                    value={fields.witness2}
                    onChange={onChangeFields}
                />
            </Form.LabeledSet>
            <div className="pt-4">
                <Button isSubmit disabled={isLoading}>
                    {isLoading ? "提交中..." : "確定"}
                </Button>
            </div>
        </form>
    );
};
