// Copyright (C) 2022-2025 Intel Corporation
// LIMITED EDGE SOFTWARE DISTRIBUTION LICENSE

import { FC, ReactNode } from 'react';

import { Grid, View } from '@adobe/react-spectrum';
import { Outlet } from 'react-router-dom';

import { BreadcrumbItemProps } from '../../../../shared/components/breadcrumbs/breadcrumb/breadcrumb.interface';
import { Breadcrumbs } from '../breadcrumbs/breadcrumbs.component';

interface DetailsContentLayoutProps {
    breadcrumbs: BreadcrumbItemProps[];
    sidebar: ReactNode;
}

export const DetailsContentLayout: FC<DetailsContentLayoutProps> = ({ breadcrumbs, sidebar }) => {
    return (
        <>
            <Breadcrumbs breadcrumbs={breadcrumbs} />
            <Grid columns={['size-3600', 'auto']} height={'100%'} UNSAFE_style={{ overflowY: 'hidden' }}>
                {sidebar}
                <View
                    backgroundColor={'gray-50'}
                    paddingX={'size-800'}
                    paddingY={'size-450'}
                    height={'100%'}
                    overflow={'hidden'}
                    UNSAFE_style={{ boxSizing: 'border-box' }}
                >
                    <Outlet />
                </View>
            </Grid>
        </>
    );
};
