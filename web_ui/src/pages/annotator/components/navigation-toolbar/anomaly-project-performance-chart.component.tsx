// Copyright (C) 2022-2025 Intel Corporation
// LIMITED EDGE SOFTWARE DISTRIBUTION LICENSE

import { Flex, Heading } from '@adobe/react-spectrum';

import { ProjectIdentifier } from '../../../../core/projects/core.interface';
import { paths } from '../../../../core/services/routes';
import { RouterLink } from '../../../../shared/components/router-link/router-link.component';
import { AccuracyHalfDonutChart } from '../../../project-details/components/project-models/models-container/model-card/accuracy-container/accuracy-half-donut-chart';

import classes from './navigation-toolbar.module.scss';

interface AnomalyProjectPerformanceChartProps {
    score: number | null;
    label: string;
    projectIdentifier: ProjectIdentifier;
}

export const AnomalyProjectPerformanceChart = ({
    projectIdentifier,
    score,
    label,
}: AnomalyProjectPerformanceChartProps): JSX.Element => {
    if (score === null) {
        return (
            <Heading width='size-1250' UNSAFE_style={{ fontWeight: 'bold', textAlign: 'center' }}>
                {label} is not available
            </Heading>
        );
    }

    return (
        <RouterLink to={paths.project.models.index(projectIdentifier)} height={'100%'}>
            <Flex
                direction={'column'}
                height={'100%'}
                alignItems={'center'}
                UNSAFE_className={classes.anomalyPerformanceChart}
            >
                <AccuracyHalfDonutChart value={score} size={'XL'} title={label} ariaLabel={label} />
            </Flex>
        </RouterLink>
    );
};
