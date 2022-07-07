import React from "react";

import { atomicAssets } from "config";
import { assetToLocaleString, openInNewTab, useCountdown } from "_app";
import { NFT } from "_app/ui/icons";
import { MemberNFTAssetData, MemberNFTAuctionData, MemberNFT } from "nfts";

export const NFTInfo = ({ member }: { member: MemberNFT }) => {
    if (member.auctionData) {
        return <AuctionBadge auctionData={member.auctionData} />;
    }

    if (!member.assetData) return null;

    if (member.saleId) {
        return (
            <SaleBadge assetData={member.assetData} saleId={member.saleId} />
        );
    }

    return <AssetBadge assetData={member.assetData} />;
};

export default NFTInfo;

const AuctionBadge = ({
    auctionData,
}: {
    auctionData: MemberNFTAuctionData;
}) => {
    const countdown = useCountdown({
        endTime: new Date(auctionData.bidEndTime as number),
        interval: 30000,
    });

    const goToAuction = (e: React.MouseEvent) => {
        e.stopPropagation();
        const url = `${atomicAssets.hubUrl}/market/auction/${auctionData.auctionId}`;
        openInNewTab(url);
    };

    return (
        <NFTBadge onClick={goToAuction}>
            {auctionData.price ? (
                <>
                    <p>{assetToLocaleString(auctionData.price, 4)}</p>
                    <p>•</p>
                </>
            ) : null}
            <p>{countdown["d-h-m"] || "auction ended"}</p>
        </NFTBadge>
    );
};

const SaleBadge = ({
    assetData,
    saleId,
}: {
    assetData: MemberNFTAssetData;
    saleId: string;
}) => (
    <div
        className="flex items-center space-x-1 text-gray-500 hover:text-gray-600 transition -mb-px"
        onClick={(e) => {
            e.stopPropagation();
            const url = `${atomicAssets.hubUrl}/market/sale/${saleId}`;
            openInNewTab(url);
        }}
    >
        <NFT size={17} />
        <p>#{assetData.templateMint} ON SALE</p>
    </div>
);

const AssetBadge = ({ assetData }: { assetData: MemberNFTAssetData }) => (
    <NFTBadge
        onClick={(e) => {
            e.stopPropagation();
            const url = `${atomicAssets.hubUrl}/explorer/asset/${assetData?.assetId}`;
            openInNewTab(url);
        }}
    />
);

interface NFTBadgeProps {
    onClick: (e: React.MouseEvent) => void;
    children?: React.ReactNode;
}

const NFTBadge = ({ onClick, children }: NFTBadgeProps) => (
    <div
        className="flex items-center space-x-1 text-gray-500 hover:text-gray-600 transition -mb-px"
        onClick={onClick}
    >
        <NFT size={17} />
        {children}
    </div>
);
