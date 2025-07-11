// Copyright (C) 2022-2025 Intel Corporation
// LIMITED EDGE SOFTWARE DISTRIBUTION LICENSE

import { Content, Dialog, DialogTrigger, Divider, Flex, Heading, Link, Text, View } from '@adobe/react-spectrum';
import { StyleProps } from '@react-types/shared';
import take from 'lodash/take';

import { useCreditsQueries } from '../../../core/credits/hooks/use-credits-api.hook';
import { useOrganizationIdentifier } from '../../../hooks/use-organization-identifier/use-organization-identifier.hook';
import { CreditAccountsTable } from './credit-accounts-table/credit-account-table.component';

export const UsageCreditAccountsCard = (props: StyleProps): JSX.Element => {
    const { useCreditsQuery } = useCreditsQueries();
    const { organizationId } = useOrganizationIdentifier();
    const {
        creditAccounts,
        isLoading: creditAccountsIsLoading,
        totalMatchedCount,
        isFetchingNextPage: creditAccountsIsFetchingNextPage,
        getNextPage: creditAccountsGetNextPage,
    } = useCreditsQuery({ organizationId });

    return (
        <View {...props}>
            <Heading level={2}>Credit consumption</Heading>
            <Text>
                Credits can be used for training models or optimization. 1 credit is equal to 1 image used for
                training/optimization. In order to optimize the credit usage we recommend to keep the auto-training
                enabled.
            </Text>
            <Flex justifyContent={'space-between'} alignItems={'baseline'} marginTop={'size-600'}>
                <Heading level={2}>Credit balance</Heading>
                {totalMatchedCount > 2 && (
                    <DialogTrigger>
                        <Link>Show all credit accounts</Link>
                        <Dialog width={{ base: '80vw', L: '50vw' }} isDismissable>
                            <Heading level={2}>Credit accounts</Heading>
                            <Divider size={'S'} />
                            <Content>
                                <CreditAccountsTable
                                    id='credit-accounts-table-full-id'
                                    data-testid='credit-accounts-table-full'
                                    creditAccounts={creditAccounts}
                                    isLoading={creditAccountsIsLoading}
                                    isLoadingNextPage={creditAccountsIsFetchingNextPage}
                                    getNextPage={creditAccountsGetNextPage}
                                />
                            </Content>
                        </Dialog>
                    </DialogTrigger>
                )}
            </Flex>
            <CreditAccountsTable
                id='credit-accounts-table-short-id'
                data-testid='credit-accounts-table-short'
                creditAccounts={take(creditAccounts, 2)}
                isLoading={creditAccountsIsLoading}
            />
        </View>
    );
};
