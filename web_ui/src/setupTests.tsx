// Copyright (C) 2022-2025 Intel Corporation
// LIMITED EDGE SOFTWARE DISTRIBUTION LICENSE

import '@testing-library/jest-dom';
import 'core-js';
import 'jest-canvas-mock';

import { ComponentType, PropsWithChildren, ReactNode } from 'react';

import { initializeMetrics } from './analytics/metrics';
import { API_URLS } from './core/services/urls';
import * as CanvasUtils from './shared/canvas-utils';
import { isLargeSizeQuery as mockIsLargeSizeQuery } from './theme/queries';

window.ResizeObserver = class ResizeObserver {
    observe() {
        // empty
    }
    unobserve() {
        // empty
    }
    disconnect() {
        // empty
    }
};

window.matchMedia = () => ({
    onchange: jest.fn(),
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
    matches: true,
    media: '',
});

HTMLMediaElement.prototype.play = async () => {
    return;
};

HTMLMediaElement.prototype.pause = async () => {
    return;
};

// Force spectrum to render the desktop version of the combobox
// This makes it so that we can sue code like,
//          act(() => {
//              userEvent.selectOptions(
//                  screen.getByRole('listbox', { name: 'Role' }),
//                  screen.getByRole('option', { name: /Contributor/ })
//              );
//          });
// without having to add { hidden: true }
jest.spyOn(window.HTMLElement.prototype, 'clientWidth', 'get').mockImplementation(() => 1000);
jest.spyOn(window.HTMLElement.prototype, 'clientHeight', 'get').mockImplementation(() => 1000);

jest.mock('screenfull', () => ({
    onchange: jest.fn(),
}));

// We need to specifically mock this util because it uses `import.meta.url` which is not supported by jest.
// More info at https://github.com/facebook/jest/issues/12183

jest.mock('./hooks/use-load-ai-webworker/utils', () => ({ getWorker: jest.fn() }));
jest.mock('./pages/camera-page/hooks/use-load-camera-webworker', () => ({
    useLoadCameraWebworker: jest.fn(() => ({ current: null })),
}));

jest.mock('comlink', () => ({
    wrap: jest.fn(() => ({
        waitForOpenCV: jest.fn(() => Promise.resolve()),
        terminate: jest.fn(),
    })),
}));

jest.mock('recharts', () => {
    const MockResponsiveContainer = ({ children }: { children: ReactNode }) => (
        <div style={{ width: 200, height: 200 }}>{children}</div>
    );

    return {
        ...jest.requireActual('recharts'),
        ResponsiveContainer: MockResponsiveContainer,
    };
});

jest.mock('@opentelemetry/core/build/src/platform/node/timer-util.js', () => ({ unrefTimer: jest.fn() }));

jest.mock('react-virtuoso', () => {
    const { VirtuosoGrid, Virtuoso, ...rest } = jest.requireActual('react-virtuoso');
    const { forwardRef } = jest.requireActual('react');

    const mockVirtuoso = <T extends { totalCount?: number; data?: never[] }>(
        WrappedVirtuoso: ComponentType<PropsWithChildren<T>>
    ) =>
        forwardRef((props: T, ref: null) => {
            return (
                <WrappedVirtuoso initialItemCount={props?.totalCount ?? props.data?.length ?? 1} ref={ref} {...props} />
            );
        });
    return { VirtuosoGrid: mockVirtuoso(VirtuosoGrid), Virtuoso: mockVirtuoso(Virtuoso), ...rest };
});

jest.mock('react-aria-components', () => {
    const { Virtualizer, ...rest } = jest.requireActual('react-aria-components');
    const { forwardRef } = jest.requireActual('react');

    const mockVirtualizer = () =>
        forwardRef((props: Record<string, unknown>) => {
            // "rowHeight" is necessary for testing purposes, or the container will render empty
            return <Virtualizer layoutOptions={{ rowHeight: 50 }} {...props} />;
        });

    return { Virtualizer: mockVirtualizer(), ...rest };
});

jest.mock('@react-spectrum/utils', () => ({
    ...jest.requireActual('@react-spectrum/utils'),
    useMediaQuery: (query: string) => {
        return mockIsLargeSizeQuery === query;
    },
}));

const mockMeter = initializeMetrics(
    {
        serviceVersion: 'service-version',
        serviceName: 'service-name',
    },
    API_URLS
).meterProvider.getMeter('default');

jest.mock('./analytics/analytics-provider.component', () => ({
    ...jest.requireActual('./analytics/analytics-provider.component'),
    useAnalytics: jest.fn(() => ({
        meter: mockMeter,
    })),
}));

jest.spyOn(CanvasUtils, 'getImageData').mockImplementation(
    (image: HTMLImageElement) => new ImageData(image?.width || 1, image?.height || 1)
);

const mockConfig = {
    servingMode: 'on-prem',
    auth: {
        type: 'dex',
        clientId: 'web_ui',
        authority: '/dex',
    },
    controlPlaneUrl: null,
    dataPlaneUrl: null,
    docsUrl: 'https://docs.geti.intel.com/on-prem/2.6/',
    configUrl: 'https://config.geti.example.com',
};
jest.mock('./core/services/use-deployment-config-query.hook', () => ({
    ...jest.requireActual('./core/services/use-deployment-config-query.hook'),
    useDeploymentConfigQuery: jest.fn(() => ({
        data: mockConfig,
    })),
}));

process.env.REACT_APP_VALIDATION_COMPONENT_TESTS = 'true';
