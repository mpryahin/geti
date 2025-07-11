// Copyright (C) 2022-2025 Intel Corporation
// LIMITED EDGE SOFTWARE DISTRIBUTION LICENSE

import isNil from 'lodash/isNil';

import { CREDIT_COST_PER_IMAGE_OR_VIDEO } from '../../../core/credits/credits.interface';
import { useFeatureFlags } from '../../../core/feature-flags/hooks/use-feature-flags.hook';
import { ObjectsPerLabelInterface } from '../../../core/statistics/dtos/dataset-statistics.interface';
import { useDatasetStatistics } from '../../../core/statistics/hooks/use-dataset-statistics.hook';
import { useDatasetIdentifier } from '../../annotator/hooks/use-dataset-identifier.hook';

const countObjectsPerLabel = (objectsPerLabelInterface: ObjectsPerLabelInterface[]) =>
    objectsPerLabelInterface.reduce((counter, { value }) => counter + value, 0);

export const useTotalCreditPrice = () => {
    const { FEATURE_FLAG_CREDIT_SYSTEM } = useFeatureFlags();
    const { useGetAllTaskDatasetStatistics } = useDatasetStatistics({
        allTasksStatisticsEnabled: FEATURE_FLAG_CREDIT_SYSTEM,
    });
    const { organizationId, workspaceId, projectId, datasetId } = useDatasetIdentifier();
    const { data: statisticsData, isPending } = useGetAllTaskDatasetStatistics({
        organizationId,
        workspaceId,
        projectId,
        datasetId,
    });

    const getCreditPrice = (taskId?: string) => {
        if (!FEATURE_FLAG_CREDIT_SYSTEM || isPending || !statisticsData) {
            return { totalCreditsToConsume: null, totalMedias: null };
        }

        const [firstTask] = statisticsData.tasks;
        const isFirstTask = firstTask.id === taskId;
        const overViewCount = firstTask.annotatedFrames + firstTask.annotatedImages;
        const isTaskChain = statisticsData.tasks.length > 1;

        if (!isTaskChain || isFirstTask) {
            return {
                totalCreditsToConsume: overViewCount * CREDIT_COST_PER_IMAGE_OR_VIDEO,
                totalMedias: overViewCount,
            };
        }

        const totalObjectsPerLabel = countObjectsPerLabel(firstTask.objectsPerLabel);

        if (!isNil(taskId) && !isFirstTask) {
            return {
                totalCreditsToConsume: totalObjectsPerLabel * CREDIT_COST_PER_IMAGE_OR_VIDEO,
                totalMedias: totalObjectsPerLabel,
            };
        }

        const totalMedias = overViewCount + totalObjectsPerLabel;

        return {
            totalCreditsToConsume: totalMedias * CREDIT_COST_PER_IMAGE_OR_VIDEO,
            totalMedias,
        };
    };

    return { isLoading: isPending || !statisticsData, getCreditPrice };
};
