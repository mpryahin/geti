// Copyright (C) 2022-2025 Intel Corporation
// LIMITED EDGE SOFTWARE DISTRIBUTION LICENSE

import { Back } from '../../../assets/icons';
import { ActionButton } from '../button/button.component';

interface BackButtonProps {
    onPress: () => void;
}

export const BackButton = ({ onPress }: BackButtonProps): JSX.Element => {
    return (
        <ActionButton id='go-back-button' data-testid='go-back-button' isQuiet onPress={onPress} aria-label='Back'>
            <Back />
        </ActionButton>
    );
};
