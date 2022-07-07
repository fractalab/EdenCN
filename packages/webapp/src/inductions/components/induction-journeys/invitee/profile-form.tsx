import { FormEvent, useState } from "react";

import { edenContractAccount, validUploadActions } from "config";
import { useFormFields, handleFileChange, ipfsUrl } from "_app";
import { Form, Heading, Button, HelpLink, Image } from "_app/ui";
import { NewMemberProfile } from "inductions";
import { MemberSocialHandles } from "members/interfaces";

interface Props {
    newMemberProfile: NewMemberProfile;
    onSubmit?: (
        newMemberProfile: NewMemberProfile,
        selectedProfilePhoto?: File
    ) => void;
    selectedProfilePhoto?: File;
}

export const InductionProfileForm = ({
    newMemberProfile,
    onSubmit,
    selectedProfilePhoto,
}: Props) => {
    const [selectedImage, setSelectedImage] = useState<File | undefined>(
        selectedProfilePhoto
    );

    const [fields, setFields] = useFormFields({ ...newMemberProfile });
    const [socialFields, setSocialFields] = useFormFields(
        convertNewMemberProfileSocial(newMemberProfile.social)
    );

    const onChangeFields = (e: React.ChangeEvent<HTMLInputElement>) =>
        setFields(e);

    const onChangeSocialFields = (e: React.ChangeEvent<HTMLInputElement>) =>
        setSocialFields(e);

    const prepareData = (e: FormEvent) => {
        e.preventDefault();
        if (!onSubmit) return;

        const socialHandles = { ...socialFields };
        Object.keys(socialHandles).forEach((keyString) => {
            const key = keyString as keyof MemberSocialHandles;
            if (!socialHandles[key]) delete socialHandles[key];
        });

        onSubmit(
            { ...fields, social: JSON.stringify(socialHandles) },
            selectedImage
        );
    };

    return (
        <form onSubmit={prepareData} className="grid grid-cols-6 gap-4">
            <Form.LabeledSet
                label="姓名"
                htmlFor="name"
                className="col-span-6"
            >
                <Form.Input
                    id="name"
                    type="text"
                    required
                    value={fields.name}
                    onChange={onChangeFields}
                />
            </Form.LabeledSet>

            <Form.LabeledSet label="" htmlFor="imgFile" className="col-span-6">
                <div className="flex items-center mb-1 space-x-1">
                    <p className="text-sm font-medium text-gray-700">
                        個人資料照片
                    </p>
                    <HelpLink href="https://www.notion.so/edenos/Upload-Profile-Photo-c15a7a050d3c411faca21a3cd3d2f0a3" />
                </div>
                <Form.FileInput
                    id="imgFile"
                    accept="image/*"
                    label={
                        selectedImage || fields.img
                            ? "選擇另一張照片"
                            : "選擇照片"
                    }
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleFileChange(
                            e,
                            "image",
                            validUploadActions[edenContractAccount][
                                "inductprofil"
                            ].maxSize,
                            setSelectedImage
                        )
                    }
                />
                <ProfileImage image={selectedImage ?? fields.img} />
            </Form.LabeledSet>

            <Form.LabeledSet
                label="個人資料圖片的來源（选填）"
                htmlFor="attributions"
                className="col-span-6"
            >
                <Form.Input
                    id="attributions"
                    type="text"
                    value={fields.attributions}
                    onChange={onChangeFields}
                />
            </Form.LabeledSet>

            <Form.LabeledSet
                label="個人簡介"
                htmlFor="bio"
                className="col-span-6"
            >
                <Form.TextArea
                    id="bio"
                    required
                    value={fields.bio}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                        setFields(e)
                    }
                />
            </Form.LabeledSet>

            <Heading size={3} className="col-span-6">
                社交賬號和鏈接
            </Heading>
            <Form.LabeledSet
                label="EOSCommunity.org 用戶名"
                htmlFor="eosCommunity"
                className="col-span-6 md:col-span-3 lg:col-span-6 xl:col-span-3"
            >
                <Form.Input
                    id="eosCommunity"
                    type="text"
                    value={socialFields.eosCommunity}
                    onChange={onChangeSocialFields}
                    placeholder="用戶名"
                />
            </Form.LabeledSet>
            <Form.LabeledSet
                label="Twitter"
                htmlFor="twitter"
                className="col-span-6 md:col-span-3 lg:col-span-6 xl:col-span-3"
            >
                <Form.Input
                    id="twitter"
                    type="text"
                    value={socialFields.twitter}
                    onChange={onChangeSocialFields}
                    placeholder="賬號名"
                />
            </Form.LabeledSet>
            <Form.LabeledSet
                label="Telegram"
                htmlFor="telegram"
                className="col-span-6 md:col-span-3 lg:col-span-6 xl:col-span-3"
            >
                <Form.Input
                    id="telegram"
                    required
                    type="text"
                    value={socialFields.telegram}
                    onChange={onChangeSocialFields}
                    placeholder="賬號名"
                />
            </Form.LabeledSet>
            <Form.LabeledSet
                label="個人網站"
                htmlFor="blog"
                className="col-span-6 md:col-span-3 lg:col-span-6 xl:col-span-3"
            >
                <Form.Input
                    id="blog"
                    type="text"
                    value={socialFields.blog}
                    onChange={onChangeSocialFields}
                    placeholder="你的個人網站"
                />
            </Form.LabeledSet>
            <Form.LabeledSet
                label="LinkedIn"
                htmlFor="linkedin"
                className="col-span-6 md:col-span-3 lg:col-span-6 xl:col-span-3"
            >
                <Form.Input
                    id="linkedin"
                    type="text"
                    value={socialFields.linkedin}
                    onChange={onChangeSocialFields}
                    placeholder="賬號名"
                />
            </Form.LabeledSet>
            <Form.LabeledSet
                label="Facebook"
                htmlFor="facebook"
                className="col-span-6 md:col-span-3 lg:col-span-6 xl:col-span-3"
            >
                <Form.Input
                    id="facebook"
                    type="text"
                    value={socialFields.facebook}
                    onChange={onChangeSocialFields}
                    placeholder="用戶名"
                />
            </Form.LabeledSet>

            {onSubmit && (
                <div className="col-span-6 pt-4">
                    <Button isSubmit>預覽個人資料</Button>
                </div>
            )}
        </form>
    );
};

const ProfileImage = ({ image }: { image?: File | string }) => {
    if (!image)
        return (
            <Image
                src="/images/blank-profile-picture.svg"
                alt="blank profile pic"
                className="rounded-full h-24 w-24 my-2 mx-auto"
                key="blank-profile-placeholder-image"
            />
        );

    let imageUrl: string;
    if (typeof image == "string") {
        imageUrl = ipfsUrl(image);
    } else {
        imageUrl = URL.createObjectURL(image);
    }

    return (
        <Image
            src={imageUrl}
            alt="profile pic"
            className="object-cover rounded-full h-24 w-24 mt-4 mx-auto"
            key={imageUrl}
        />
    );
};

const convertNewMemberProfileSocial = (social: string): MemberSocialHandles => {
    const socialHandles = JSON.parse(social || "{}");
    return {
        eosCommunity: socialHandles.eosCommunity || "",
        twitter: socialHandles.twitter || "",
        linkedin: socialHandles.linkedin || "",
        telegram: socialHandles.telegram || "",
        facebook: socialHandles.facebook || "",
        blog: socialHandles.blog || "",
    };
};
