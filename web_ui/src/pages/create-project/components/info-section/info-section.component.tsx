// Copyright (C) 2022-2025 Intel Corporation
// LIMITED EDGE SOFTWARE DISTRIBUTION LICENSE

import { Flex, FlexProps, Text } from '@adobe/react-spectrum';

import classes from './info-section.module.scss';

interface InfoSectionProps extends Omit<FlexProps, 'children'> {
    icon: JSX.Element;
    message: string;
}

export const InfoSection = ({ icon, message, ...flexProps }: InfoSectionProps): JSX.Element => {
    return (
        <Flex UNSAFE_className={classes.infoWrapper} data-testid='info-section' {...flexProps}>
            {icon}
            <Text>{message}</Text>
        </Flex>
    );
};
