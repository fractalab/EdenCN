import {
    assetToLocaleString,
    Container,
    Heading,
    Loader,
    Text,
    useTreasuryStats,
} from "_app";

export const TreasuryHeader = () => {
    const { data: treasuryStats, isLoading } = useTreasuryStats();

    return (
        <Container className="flex justify-between items-center">
            <Heading size={1}>
                <span className="hidden xs:inline">Eden </span>社區金庫
            </Heading>
            {isLoading ? (
                <div>
                    <Loader size={24} />
                </div>
            ) : treasuryStats ? (
                <div className="text-right">
                    <Text className="font-medium">餘額</Text>
                    <Text size="lg">{assetToLocaleString(treasuryStats)}</Text>
                </div>
            ) : null}
        </Container>
    );
};

export default TreasuryHeader;
