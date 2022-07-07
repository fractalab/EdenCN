import React from "react";

import { minimumDonationAmount } from "config";
import { assetToLocaleString } from "_app";

import { Step, Steps } from ".";

export type InductionStep =
    | InductionStepGenesis
    | InductionStepInviter
    | InductionStepInvitee;

export enum InductionStepInvitee {
    GetInvite = "invitee-get-invite",
    Profile = "invitee-profile",
    PendingVideoAndEndorsements = "invitee-pending-video-and-endorsements",
    Donate = "invitee-donate",
    Complete = "invitee-complete",
}

export const INVITEE_INDUCTION_STEPS: Step[] = [
    {
        key: InductionStepInvitee.GetInvite,
        title: "獲得邀請",
        text: "請確保你已有 EOS 賬號。",
    },
    {
        key: InductionStepInvitee.Profile,
        title: "設置個人資料",
        text: "讓社區知道你是誰.",
    },
    {
        key: InductionStepInvitee.PendingVideoAndEndorsements,
        title: "獲得確認",
        text: "完成見證.",
    },
    {
        key: InductionStepInvitee.Donate,
        title: "捐款",
        text: `捐贈 ${assetToLocaleString(
            minimumDonationAmount
        )} 给中文Eden社區.`,
    },
    {
        key: InductionStepInvitee.Complete,
        title: "完成",
        text: "NFT 鑄造完成,歡迎來到中文Eden",
    },
];

export enum InductionStepInviter {
    CreateInvite = "inviter-create-invite",
    PendingProfile = "inviter-pending-profile",
    VideoAndEndorse = "inviter-video-and-endorse",
    PendingDonation = "inviter-pending-donation",
    Complete = "inviter-complete",
}

export const INVITER_INDUCTION_STEPS: Step[] = [
    {
        key: InductionStepInviter.CreateInvite,
        title: "创建邀請",
        text: "填寫被邀請人以及兩位見證人的 EOS 賬號",
    },
    {
        key: InductionStepInviter.PendingProfile,
        title: "被邀請人資料",
        text: "被邀請人需要用相應的 EOS 賬號登錄社區網站并提交個人信息。",
    },
    {
        key: InductionStepInviter.VideoAndEndorse,
        title: "加入與見證",
        text:
            "記錄並上傳見證視頻。在視頻記錄中，邀請人和兩位見證人需要明確同意被邀請人加入社區。",
    },
    {
        key: InductionStepInviter.PendingDonation,
        title: "被邀請人捐款",
        text: `被邀請人向 Eden 捐贈 ${assetToLocaleString(
            minimumDonationAmount
        )} .`,
    },
    {
        key: InductionStepInviter.Complete,
        title: "完成",
        text: "新成員對應的 NFT 鑄造完成。被邀請人正式成為社區成員。",
    },
];

export enum InductionStepGenesis {
    Profile = "genesis-profile",
    Donate = "genesis-donate",
    StandBy = "genesis-standby",
    Complete = "genesis-complete",
}

export const GENESIS_INDUCTION_STEPS: Step[] = [
    {
        key: InductionStepGenesis.Profile,
        title: "設置個人資料",
        text: "讓社區知道你是誰.",
    },
    {
        key: InductionStepGenesis.Donate,
        title: "捐贈",
        text: `向社區捐贈不低於 ${assetToLocaleString(
            minimumDonationAmount
        )} .`,
    },
    {
        key: InductionStepGenesis.StandBy,
        title: "等待激活",
        text:
            "所有 創始成員全部加入後系統才會正式激活。",
    },
    {
        key: InductionStepGenesis.Complete,
        title: "完成",
        text: "系統已激活,欢迎来到Edencn",
    },
];

interface Props {
    step: InductionStep;
    children: React.ReactNode;
}

export const InductionStepsContainer = ({ step, children }: Props) => {
    const isStepIn = <T,>(steps: T) => Object.values(steps).includes(step);

    let steps: Step[] = INVITEE_INDUCTION_STEPS;
    if (isStepIn(InductionStepGenesis)) {
        steps = GENESIS_INDUCTION_STEPS;
    } else if (isStepIn(InductionStepInviter)) {
        steps = INVITER_INDUCTION_STEPS;
    }

    return (
        <div className="flex flex-col lg:flex-row lg:items-center">
            <div className="lg:w-1/2 px-4 sm:px-12 pt-8 pb-4">{children}</div>
            <div className="lg:w-1/2 mt-8 sm:px-8 lg:px-0 self-start">
                <Steps steps={steps} currentStep={step} />
            </div>
        </div>
    );
};
