// Copyright (C) 2022-2025 Intel Corporation
// LIMITED EDGE SOFTWARE DISTRIBUTION LICENSE

import { useNavigate } from 'react-router-dom';

import { paths } from '../../../../core/services/routes';
import { Button } from '../../../../shared/components/button/button.component';
import { useCameraParams } from '../../hooks/camera-params.hook';

export const TakeShotsButton = (): JSX.Element => {
    const navigate = useNavigate();
    const { hasDefaultLabel, defaultLabelId, ...datasetIdentifier } = useCameraParams();

    const cameraPagePath = paths.project.dataset.camera(datasetIdentifier);

    return (
        <Button
            variant={'primary'}
            onPress={() =>
                navigate(hasDefaultLabel ? `${cameraPagePath}?defaultLabelId=${defaultLabelId}` : cameraPagePath)
            }
        >
            Take shots
        </Button>
    );
};
