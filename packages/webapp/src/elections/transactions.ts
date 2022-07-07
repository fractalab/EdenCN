import { edenContractAccount } from "config";
import { EncryptedKey } from "encryption";

export const setElectionMeeting = (
    authorizerAccount: string,
    round: number,
    keys: EncryptedKey[],
    data: Uint8Array,
    old_data?: Uint8Array
) => ({
    actions: [
        {
            account: edenContractAccount,
            name: "electmeeting",
            authorization: [
                {
                    actor: authorizerAccount,
                    permission: "active",
                },
            ],
            data: {
                account: authorizerAccount,
                round,
                keys,
                data,
                old_data,
            },
        },
    ],
});

export const setElectionParticipation = (
    authorizerAccount: string,
    participating: boolean
) => ({
    actions: [
        {
            account: edenContractAccount,
            name: "electopt",
            authorization: [
                {
                    actor: authorizerAccount,
                    permission: "active",
                },
            ],
            data: {
                member: authorizerAccount,
                participating,
            },
        },
    ],
});

export const setVote = (
    authorizerAccount: string,
    round: number,
    candidate: string
) => ({
    actions: [
        {
            account: edenContractAccount,
            name: "electvote",
            authorization: [
                {
                    actor: authorizerAccount,
                    permission: "active",
                },
            ],
            data: {
                round,
                voter: authorizerAccount,
                candidate,
            },
        },
    ],
});

export const setElectionRoundVideo = (
    authorizerAccount: string,
    round: number,
    video: string
) => ({
    actions: [
        {
            account: edenContractAccount,
            name: "electvideo",
            authorization: [
                {
                    actor: authorizerAccount,
                    permission: "active",
                },
            ],
            data: {
                round,
                voter: authorizerAccount,
                video,
            },
        },
    ],
});
