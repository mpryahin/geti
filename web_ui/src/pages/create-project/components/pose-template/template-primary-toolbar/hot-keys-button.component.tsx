// Copyright (C) 2022-2025 Intel Corporation
// LIMITED EDGE SOFTWARE DISTRIBUTION LICENSE

import { ReactNode } from 'react';

import { Content, Dialog, DialogTrigger, Divider, Flex, Keyboard, Text, View } from '@adobe/react-spectrum';

import { Hotkeys, LeftClick, RightClick } from '../../../../../assets/icons';
import { QuietActionButton } from '../../../../../shared/components/quiet-button/quiet-action-button.component';

import classes from './hot-keys-button.module.scss';

interface HotKeysItemProps {
    text: string;
    children: ReactNode;
}
const HotKeysItem = ({ text, children }: HotKeysItemProps) => {
    return (
        <Flex
            gap={'size-100'}
            alignItems={'center'}
            marginBottom={'size-150'}
            UNSAFE_style={{
                color: 'var(--spectrum-global-color-gray-700)',
                fontSize: 'var(--spectrum-global-dimension-font-size-75)',
                fontWeight: 'var(--spectrum-global-font-weight-bold)',
            }}
        >
            <Text width={'42%'}>{text}</Text>
            <Keyboard width={'50%'}>{children}</Keyboard>
        </Flex>
    );
};
export const HotKeysButton = (): JSX.Element => {
    return (
        <DialogTrigger type={'popover'} mobileType={'modal'} placement={'right top'} hideArrow>
            <QuietActionButton aria-label='Show dialog with hotkeys'>
                <Hotkeys />
            </QuietActionButton>
            <Dialog size='M'>
                <Content>
                    <HotKeysItem text='Create node'>
                        <LeftClick />
                    </HotKeysItem>
                    <HotKeysItem text='Create edge'>
                        <Flex gap={'size-100'}>
                            <View UNSAFE_className={classes.keyContainer} maxHeight={'size-225'}>
                                SHIFT
                            </View>
                            <Text>+</Text>
                            <View>
                                <LeftClick />
                            </View>
                            <Text>on node and drag to another node</Text>
                        </Flex>
                    </HotKeysItem>

                    <Divider size={'S'} marginBottom={'size-150'} />
                    <HotKeysItem text='Remove node or edge'>
                        <View UNSAFE_className={classes.keyContainer}>DEL</View>
                    </HotKeysItem>

                    <Divider size={'S'} marginBottom={'size-150'} />
                    <HotKeysItem text='Display the context menu'>
                        <RightClick />
                    </HotKeysItem>
                </Content>
            </Dialog>
        </DialogTrigger>
    );
};
