// Copyright (C) 2022-2025 Intel Corporation
// LIMITED EDGE SOFTWARE DISTRIBUTION LICENSE

import { Text, Tooltip, TooltipTrigger } from '@adobe/react-spectrum';

import { PressableElement } from '../../../pressable-element/pressable-element.component';
import { ConfigurableParametersComponents, ConfigurableParametersMany } from '../../configurable-parameters.interface';

import classes from '../../selectable-customized-tabs/selectable-customized-tabs.module.scss';

interface SelectableTabProps extends Pick<ConfigurableParametersMany, 'setSelectedComponentId'> {
    isSelected: boolean;
    component: ConfigurableParametersComponents;
}

export const SelectableTab = ({ component, isSelected, setSelectedComponentId }: SelectableTabProps): JSX.Element => {
    // TODO: remove this after backend capitalises the strings on the server side
    const capitalizedHeader = component.header
        .split(' ')
        .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
        .join(' ');

    return (
        <TooltipTrigger placement={'bottom'}>
            <PressableElement
                UNSAFE_className={[classes.tabItem, isSelected ? classes.tabItemSelected : ''].join(' ')}
                onPress={() => setSelectedComponentId(component.id)}
            >
                <Text>{capitalizedHeader}</Text>
            </PressableElement>
            <Tooltip>{component.description}</Tooltip>
        </TooltipTrigger>
    );
};
