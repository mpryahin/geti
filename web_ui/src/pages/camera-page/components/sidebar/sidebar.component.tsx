// Copyright (C) 2022-2025 Intel Corporation
// LIMITED EDGE SOFTWARE DISTRIBUTION LICENSE

import { useState } from 'react';

import { Flex, Tooltip, TooltipTrigger } from '@adobe/react-spectrum';
import ChevronDoubleLeft from '@spectrum-icons/workflow/ChevronDoubleLeft';
import ChevronDoubleRight from '@spectrum-icons/workflow/ChevronDoubleRight';

import { Label } from '../../../../core/labels/label.interface';
import { QuietActionButton } from '../../../../shared/components/quiet-button/quiet-action-button.component';
import { useCameraParams } from '../../hooks/camera-params.hook';
import { useCameraStorage } from '../../hooks/use-camera-storage.hook';
import { getSortingHandler, SortingOptions } from '../../util';
import { CloseSidebar } from './close-sidebar.component';
import { OpenSidebar } from './open-sidebar.component';

import classes from './sidebar.module.scss';

interface SidebarProps {
    labels: Label[];
}

const sortingByMostRecent = getSortingHandler(SortingOptions.MOST_RECENT);

export const Sidebar = ({ labels }: SidebarProps): JSX.Element => {
    const [isOpen, setIsOpen] = useState(true);
    const { isLivePrediction } = useCameraParams();
    const { savedFilesQuery } = useCameraStorage();

    const screenshots = sortingByMostRecent(savedFilesQuery?.data ?? []);

    return (
        <Flex
            margin={'size-10'}
            direction={'column'}
            width={isOpen ? 'size-3600' : 'size-1000'}
            justifyContent={'space-between'}
            UNSAFE_style={{ background: 'var(--spectrum-global-color-gray-200)' }}
        >
            {isOpen && <OpenSidebar labels={labels} screenshots={screenshots} isLivePrediction={isLivePrediction} />}

            {!isOpen && <CloseSidebar screenshots={screenshots} isLivePrediction={isLivePrediction} />}

            <TooltipTrigger placement={'bottom'}>
                <QuietActionButton
                    onPress={() => setIsOpen((prev) => !prev)}
                    aria-label={'toggle sidebar'}
                    UNSAFE_className={classes.toggleSidebarButton}
                    id='annotations-pane-sidebar-toggle-button'
                >
                    {isOpen ? <ChevronDoubleRight size='XS' /> : <ChevronDoubleLeft size='XS' />}
                </QuietActionButton>
                <Tooltip>{isOpen ? 'Collapse sidebar' : 'Open sidebar'}</Tooltip>
            </TooltipTrigger>
        </Flex>
    );
};
