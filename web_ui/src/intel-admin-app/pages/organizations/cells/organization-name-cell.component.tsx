// Copyright (C) 2022-2025 Intel Corporation
// LIMITED EDGE SOFTWARE DISTRIBUTION LICENSE

import { Flex, Tooltip, TooltipTrigger } from '@adobe/react-spectrum';

import { PhotoPlaceholder } from '../../../../shared/components/photo-placeholder/photo-placeholder.component';
import { PressableElement } from '../../../../shared/components/pressable-element/pressable-element.component';
import { TruncatedText } from '../../../../shared/components/truncated-text/truncated-text.component';
import { OrganizationAdminsCopyText } from './organization-admins-copy-text.component';

interface OrganizationNameCellProps {
    id: string;
    name: string;
}

export const OrganizationNameCell = ({ id, name }: OrganizationNameCellProps): JSX.Element => {
    return (
        <Flex width={'100%'} alignItems={'center'} gap={'size-100'}>
            <PhotoPlaceholder name={name} email={name} width={'size-300'} height={'size-300'} />
            <TooltipTrigger placement={'bottom left'}>
                <PressableElement>
                    <TruncatedText>{name}</TruncatedText>
                </PressableElement>
                <Tooltip>
                    <OrganizationAdminsCopyText
                        text={id}
                        aria-label={'Copy id'}
                        data-testid={`copy-id-${id}`}
                        confirmationMessage={'Id copied successfully'}
                    />
                </Tooltip>
            </TooltipTrigger>
        </Flex>
    );
};
