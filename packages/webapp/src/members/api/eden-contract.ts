import {
    CONTRACT_MEMBER_TABLE,
    CONTRACT_MEMBERSTATS_TABLE,
    CONTRACT_ACCOUNT_TABLE,
    getRow,
    getTableRows,
    assetFromString,
} from "_app";

import { EdenMember, MemberStats } from "../interfaces";
import { TreasuryStats } from "../../pages/api/interfaces";
import { devUseFixtureData } from "config";
import { fixtureEdenMembers, fixtureMembersStats } from "./fixtures";

export const getEdenMember = (account: string) => {
    console.log('getEdenMember------- >> ',account,devUseFixtureData)
    // if (devUseFixtureData) {
    //     if (false) {    
    //     const edenMember = fixtureEdenMembers.find(
    //         (member) => member.account === account
    //     );
    //     if (edenMember) {
    //         return Promise.resolve(edenMember);
    //     }
    // }
    return getRow<EdenMember>(CONTRACT_MEMBER_TABLE, "account", account);
};

export const getMembersStats = async () => {
    if (devUseFixtureData) return Promise.resolve(fixtureMembersStats);
    return getRow<MemberStats>(CONTRACT_MEMBERSTATS_TABLE);
};

export const getTreasuryStats = async () => {
    const rows = await getTableRows<TreasuryStats>(CONTRACT_ACCOUNT_TABLE, {
        scope: "owned",
        lowerBound: "master",
    });

    if (!rows.length) {
        return undefined;
    }

    return assetFromString(rows[0].balance);
};
