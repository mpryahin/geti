// Copyright (C) 2022-2025 Intel Corporation
// LIMITED EDGE SOFTWARE DISTRIBUTION LICENSE

import { Pin } from '../../../../../assets/icons';
import { ActionButton } from '../../../../../shared/components/button/button.component';

interface PinLabelButtonProps {
    pinLabel: (labelId: string) => void;
    labelId: string;
}

export const PinLabelButton = ({ pinLabel, labelId }: PinLabelButtonProps): JSX.Element => {
    return (
        <ActionButton isQuiet onPress={() => pinLabel(labelId)} width='size-225' height='size-225'>
            <Pin aria-label={`${labelId}-pin-icon`} id={'pin-icon'} />
        </ActionButton>
    );
};
