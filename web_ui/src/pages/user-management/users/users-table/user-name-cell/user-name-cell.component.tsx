// Copyright (C) 2022-2025 Intel Corporation
// LIMITED EDGE SOFTWARE DISTRIBUTION LICENSE

import { Flex, Tooltip, TooltipTrigger } from '@adobe/react-spectrum';

import { UserCircleFilled as AdminIcon } from '../../../../../assets/icons';
import { COLOR_MODE } from '../../../../../assets/icons/color-mode.enum';
import { USER_ROLE } from '../../../../../core/users/users.interface';
import { PressableElement } from '../../../../../shared/components/pressable-element/pressable-element.component';
import { UserPhotoPresentation } from '../../../profile-page/user-photo-container/user-photo-presentation.component';

import classes from './user-name-cell.module.scss';

interface EmailCellProps {
    cellData: string;
    dataKey: string;
    email: string;
    id: string;
    userPhoto: string | null;
    fullName: string;
    isOrgAdmin: boolean;
}

export const UserNameCell = ({
    cellData,
    dataKey,
    id,
    userPhoto,
    fullName,
    email,
    isOrgAdmin,
}: EmailCellProps): JSX.Element => {
    return (
        <Flex alignItems='center' gap='size-200' id={`${id}-${dataKey}`} width={'100%'}>
            <TooltipTrigger placement={'bottom'}>
                <PressableElement aria-label='label-relation'>
                    <>
                        <UserPhotoPresentation
                            key={id}
                            userName={fullName}
                            email={email}
                            userPhoto={userPhoto}
                            handleUploadClick={null}
                            width={'size-300'}
                            height={'size-300'}
                        />
                        {isOrgAdmin && (
                            <AdminIcon
                                color={COLOR_MODE.NEGATIVE}
                                fill='white'
                                data-testid={'organization-admin-indicator'}
                                className={classes.orgAdminIndicator}
                            />
                        )}
                    </>
                </PressableElement>
                <Tooltip>{isOrgAdmin ? USER_ROLE.ORGANIZATION_ADMIN : ''}</Tooltip>
            </TooltipTrigger>

            <span title={cellData} id={'user-name-cell'} className={classes.emailCellTitle}>
                {cellData}
            </span>
        </Flex>
    );
};
