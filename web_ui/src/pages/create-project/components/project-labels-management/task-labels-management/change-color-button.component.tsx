// Copyright (C) 2022-2025 Intel Corporation
// LIMITED EDGE SOFTWARE DISTRIBUTION LICENSE

import { View } from '@adobe/react-spectrum';
import { BorderRadiusValue } from '@react-types/shared/src/dna';
import { Responsive } from '@react-types/shared/src/style';

import { ActionButton } from '../../../../../shared/components/button/button.component';

interface ChangeColorButtonProps {
    size: 'S' | 'L';
    id: string;
    color: string | undefined;
    ariaLabelPrefix?: string;
    gridArea?: string;
}

export const ChangeColorButton = ({
    size,
    ariaLabelPrefix,
    id,
    color,
    gridArea,
}: ChangeColorButtonProps): JSX.Element => {
    const sizeParameters: { size: string; radius?: Responsive<BorderRadiusValue> } =
        size === 'L' ? { size: 'size-400', radius: 'small' } : { size: 'size-125' };

    return (
        <ActionButton
            id={id}
            data-testid={`${id}-button`}
            height={'fit-content'}
            isQuiet={false}
            aria-label={`${ariaLabelPrefix ? ariaLabelPrefix + ' ' : ''}Color picker button`}
            gridArea={gridArea}
        >
            <View
                width={sizeParameters.size}
                height={sizeParameters.size}
                minWidth={sizeParameters.size}
                borderRadius={sizeParameters.radius || undefined}
                margin={10}
                id={`${id}-selected-color`}
                UNSAFE_style={{ backgroundColor: color }}
            />
        </ActionButton>
    );
};
