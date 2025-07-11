// Copyright (C) 2022-2025 Intel Corporation
// LIMITED EDGE SOFTWARE DISTRIBUTION LICENSE

import { Flex } from '@adobe/react-spectrum';
import capitalize from 'lodash/capitalize';

import { GraphChart, Image } from '../../../../assets/icons';
import { TabItem } from '../../../../shared/components/tabs/tabs.interface';
import { ProjectAnnotationsStatistics } from '../project-annotations/project-annotations-statistics.component';
import { ProjectMedia } from '../project-media/project-media.component';
import { DatasetChapters } from './utils';

export const ChildrenTabs = (): TabItem[] => {
    return [
        {
            id: `${DatasetChapters.MEDIA}-id`,
            key: DatasetChapters.MEDIA,
            name: (
                <Flex alignItems={'center'} gap={'size-75'}>
                    <Image />
                    {capitalize(DatasetChapters.MEDIA)}
                </Flex>
            ),
            children: <ProjectMedia />,
        },
        {
            id: `${DatasetChapters.STATISTICS}-id`,
            key: DatasetChapters.STATISTICS,
            name: (
                <Flex alignItems={'center'} gap={'size-75'}>
                    <GraphChart />
                    {capitalize(DatasetChapters.STATISTICS)}
                </Flex>
            ),
            children: <ProjectAnnotationsStatistics />,
        },
    ];
};
