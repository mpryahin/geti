# Copyright (C) 2020-2021 Intel Corporation
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
# http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing,
# software distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions
# and limitations under the License.

import itertools
import warnings
from datetime import datetime

import numpy as np
import pytest
from shapely.geometry.polygon import Polygon

from iai_core.entities.color import Color
from iai_core.entities.label import Domain, Label
from iai_core.entities.scored_label import ScoredLabel
from iai_core.entities.shapes import Rectangle, ShapeType
from iai_core.utils.time_utils import now

from geti_types import ID


class TestRectangle:
    modification_date = now()

    @staticmethod
    def rectangle_labels() -> list:
        rectangle_label = Label(
            name="Rectangle label",
            domain=Domain.DETECTION,
            color=Color(red=100, green=50, blue=200),
            id_=ID("rectangle_label_1"),
        )
        other_rectangle_label = Label(
            name="Other rectangle label",
            domain=Domain.SEGMENTATION,
            color=Color(red=200, green=80, blue=100),
            id_=ID("rectangle_label_2"),
        )
        return [
            ScoredLabel(label_id=rectangle_label.id_, is_empty=rectangle_label.is_empty),
            ScoredLabel(label_id=other_rectangle_label.id_, is_empty=other_rectangle_label.is_empty),
        ]

    @staticmethod
    def horizontal_rectangle_params() -> dict:
        return {"x1": 0.1, "y1": 0.0, "x2": 0.4, "y2": 0.2}

    def horizontal_rectangle(self) -> Rectangle:
        return Rectangle(**self.horizontal_rectangle_params())

    def vertical_rectangle_params(self) -> dict:
        return {
            "x1": 0.1,
            "y1": 0.1,
            "x2": 0.3,
            "y2": 0.4,
            "modification_date": datetime(year=2020, month=1, day=1, hour=9, minute=30, second=15, microsecond=2),
        }

    def vertical_rectangle(self) -> Rectangle:
        return Rectangle(**self.vertical_rectangle_params())

    @staticmethod
    def square_params() -> dict:
        return {"x1": 0.1, "y1": 0.1, "x2": 0.3, "y2": 0.3}

    def square(self) -> Rectangle:
        return Rectangle(**self.square_params())

    def test_rectangle_required_parameters(self):
        """
        <b>Description:</b>
        Check Rectangle class instance required parameters

        <b>Input data:</b>
        Rectangle class initiation parameters

        <b>Expected results:</b>
        Test passes if Rectangle instance has expected attributes specified during required parameters initiation

        <b>Steps</b>
        1. Compare x1, y1, x2, y2 and type Rectangle instance parameters with expected values
        """
        rectangle = self.horizontal_rectangle()
        assert rectangle.x1 == 0.1
        assert rectangle.y1 == 0.0
        assert rectangle.x2 == 0.4
        assert rectangle.y2 == 0.2
        assert rectangle.type == ShapeType.RECTANGLE

    def test_rectangle_optional_parameters(self):
        """
        <b>Description:</b>
        Check Rectangle optional parameters

        <b>Input data:</b>
        Instance of Rectangle class

        <b>Expected results:</b>
        Test passes if Rectangle instance has expected modification attributes specified during Rectangle
        class object initiation with optional parameters

        <b>Steps</b>
        1. Compare default Rectangle instance attribute with expected value
        2. Check type of default modification_date Rectangle instance attribute
        3. Compare specified Rectangle instance attribute with expected value
        4. Compare specified modification_date Rectangle instance attribute with expected value
        """
        # Checking default values of optional parameters
        default_params_rectangle = self.horizontal_rectangle()
        assert isinstance(default_params_rectangle.modification_date, datetime)
        # check for specified values of optional parameters
        specified_params_rectangle = self.vertical_rectangle()
        assert specified_params_rectangle.modification_date == datetime(
            year=2020, month=1, day=1, hour=9, minute=30, second=15, microsecond=2
        )

    def test_rectangle_coordinates_validation(self):
        """
        <b>Description:</b>
        Check Rectangle coordinates

        <b>Input data:</b>
        Rectangle class initiation parameters

        <b>Expected results:</b>
        Test passes if Rectangle correctly checks coordinates during initiation of Rectangle object

        <b>Steps</b>
        1. Check Rectangle coordinates with correct width and height
        2. Check Rectangle coordinates with incorrect width: (x2 - x1) <= 0
        3. Check Rectangle coordinates with incorrect height: (y2 - y1) <= 0
        4. Check Rectangle coordinates with all coordinates equal 0
        """
        # checks for correct width and height
        self.horizontal_rectangle()
        self.vertical_rectangle()
        self.square()
        with warnings.catch_warnings():
            warnings.filterwarnings("ignore", "Rectangle coordinates")
            Rectangle(x1=0.2, y1=0.1, x2=1.4, y2=1.5)
        Rectangle(x1=0.2, y1=0.1, x2=0.4, y2=0.5)
        # checks for incorrect coordinates
        width_less_than_zero_params = {"x1": 0.4, "y1": 0.0, "x2": 0.1, "y2": 0.2}
        width_equal_zero_params = {"x1": 0.1, "y1": 0.0, "x2": 0.1, "y2": 0.2}
        height_less_than_zero_params = {"x1": 0.1, "y1": 0.4, "x2": 0.3, "y2": 0.1}
        height_params_equal_zero_params = {"x1": 0.1, "y1": 0.4, "x2": 0.3, "y2": 0.4}
        zero_rectangle_params = {"x1": 0.0, "x2": 0.0, "y1": 0.0, "y2": 0.0}
        for incorrect_coordinates in [
            width_less_than_zero_params,
            width_equal_zero_params,
            height_less_than_zero_params,
            height_params_equal_zero_params,
            zero_rectangle_params,
        ]:
            with pytest.raises(ValueError):
                Rectangle(**incorrect_coordinates)

    def test_rectangle_clip_to_visible_region(self):
        """
        <b>Description:</b>
        Check Rectangle clip_to_visible_region method

        <b>Input data:</b>
        Rectangle class initiation parameters

        <b>Expected results:</b>
        Test passes if clip_to_visible_region method return correct value

        <b>Steps</b>
        1. Check values returned by clip_to_visible_region method for 0<x1<x2, 0<y1<y2, x1<x2<1, y1<y2<1
        2. Check values returned by clip_to_visible_region method for x1<0, y1<0, x2>1, y2>1
        3. Check values returned by clip_to_visible_region method for x1=0, y1=0, x2=1, y2=1
        4. Check ValueError exception raised if x1<0 and x1<x2<0: clipped Rectangle width will be equal 0
        5. Check ValueError exception raised if 1<x1<x2 and x2>1: clipped Rectangle width will be equal 0
        6. Check ValueError exception raised if y1<0 and y1<y2<0: clipped Rectangle height will be equal 0
        7. Check ValueError exception raised if 1<y1<y2 and y2>1: clipped Rectangle height will be equal 0
        """
        positive_scenarios = [
            {
                "input_params": {
                    "x1": 0.3,
                    "y1": 0.2,
                    "x2": 0.6,
                    "y2": 0.4,
                },
                "params_expected": {"x1": 0.3, "y1": 0.2, "x2": 0.6, "y2": 0.4},
            },
            {
                "input_params": {
                    "x1": -0.2,
                    "y1": -0.3,
                    "x2": 1.6,
                    "y2": 1.4,
                },
                "params_expected": {"x1": 0.0, "y1": 0.0, "x2": 1.0, "y2": 1.0},
            },
            {
                "input_params": {
                    "x1": 0.0,
                    "y1": 0.0,
                    "x2": 1.0,
                    "y2": 1.0,
                },
                "params_expected": {"x1": 0.0, "y1": 0.0, "x2": 1.0, "y2": 1.0},
            },
        ]
        for scenario in positive_scenarios:
            with warnings.catch_warnings():
                warnings.filterwarnings("ignore", "Rectangle coordinates")
                rectangle_actual = Rectangle(**scenario.get("input_params"))
            rectangle_expected = Rectangle(**scenario.get("params_expected"))
            rectangle_actual.modification_date = self.modification_date
            rectangle_expected.modification_date = self.modification_date
            assert rectangle_actual.clip_to_visible_region() == rectangle_expected
        negative_scenarios = [
            {"x1": -0.4, "y1": 0.2, "x2": -0.2, "y2": 0.4},
            {"x1": 1.2, "y1": 0.2, "x2": 1.6, "y2": 0.4},
            {"x1": 0.4, "y1": -0.4, "x2": 0.6, "y2": -0.2},
            {"x1": 1.2, "y1": 1.2, "x2": 1.6, "y2": 1.4},
        ]
        for scenario in negative_scenarios:
            with warnings.catch_warnings():
                warnings.filterwarnings("ignore", "Rectangle coordinates")
                rectangle_actual = Rectangle(**scenario)
            with pytest.raises(ValueError):
                rectangle_actual.clip_to_visible_region()

    def test_rectangle_normalize_wrt_roi_shape(self):
        """
        <b>Description:</b>
        Check Rectangle normalize_wrt_roi_shape method

        <b>Input data:</b>
        Instance of Rectangle class

        <b>Expected results:</b>
        Test passes if normalize_wrt_roi_shape method returns expected instance of Rectangle class

        <b>Steps</b>
        1. Check values returned by normalized Rectangle instance
        2. Check raise ValueError exception when roi parameter has unexpected type
        """
        # Positive scenario
        rectangle = self.horizontal_rectangle()
        with warnings.catch_warnings():
            warnings.filterwarnings("ignore", "Rectangle coordinates")
            roi_shape = Rectangle(x1=0.0, y1=0.0, x2=2.1, y2=2.2)
        normalized = rectangle.normalize_wrt_roi_shape(roi_shape)
        assert normalized.x1 == 0.1
        assert normalized.y1 == 0.0
        assert normalized.x2 == 0.4
        assert normalized.y2 == 0.2
        assert normalized.modification_date == rectangle.modification_date
        # Negative scenario
        with pytest.raises(ValueError):
            rectangle.normalize_wrt_roi_shape(str)

    def test_rectangle_denormalize_wrt_roi_shape(self):
        """
        <b>Description:</b>
        Check Rectangle denormalize_wrt_roi_shape method

        <b>Input data:</b>
        Instance of Rectangle class

        <b>Expected results:</b>
        Test passes if denormalize_wrt_roi_shape method return expected instance of Rectangle class

        <b>Steps</b>
        1. Check values returned by denormalized Rectangle instance
        2. Check raise ValueError exception when roi parameter has unexpected type
        """
        # Positive scenario
        rectangle = self.horizontal_rectangle()
        roi_shape = Rectangle(x1=0.2, y1=0.2, x2=0.4, y2=0.4)
        with warnings.catch_warnings():
            warnings.filterwarnings("ignore", "Rectangle coordinates")
            denormalized = rectangle.denormalize_wrt_roi_shape(roi_shape)
        assert denormalized.x1 == -0.5
        assert denormalized.y1 == -1.0
        assert denormalized.x2 == 1.0
        assert denormalized.y2 == 0.0
        assert denormalized.modification_date == rectangle.modification_date
        # Negative scenario
        with pytest.raises(ValueError):
            rectangle.denormalize_wrt_roi_shape(str)

    def test_rectangle_as_shapely_polygon(self):
        """
        <b>Description:</b>
        Check Rectangle _as_shapely_polygon method

        <b>Input data:</b>
        Instance of Rectangle class

        <b>Expected results:</b>
        Test passes if _as_shapely_polygon method returns expected instance of Polygon class

        <b>Steps</b>
        1. Check Polygon instance returned by _as_shapely_polygon method
        """
        rectangle = self.horizontal_rectangle()
        shapely_polygon = rectangle._as_shapely_polygon()
        assert shapely_polygon.__class__ == Polygon
        assert shapely_polygon.bounds == (0.1, 0.0, 0.4, 0.2)
        assert shapely_polygon.area == 0.06000000000000001

    def test_rectangle_generate_full_box(self):
        """
        <b>Description:</b>
        Check Rectangle generate_full_box method

        <b>Expected results:</b>
        Test passes if generate_full_box method returns instance of Rectangle class with coordinates
        (x1=0.0, y1=0.0, x2=1.0, y2=1.0)

        <b>Steps</b>
        1. Check generate_full_box method for Rectangle instance
        """
        full_box = Rectangle.generate_full_box()
        assert full_box.type == ShapeType.RECTANGLE
        assert full_box.x1 == full_box.y1 == 0.0
        assert full_box.x2 == full_box.y2 == 1.0

    def test_rectangle_is_full_box(self):
        """
        <b>Description:</b>
        Check Rectangle is_full_box method

        <b>Input data:</b>
        Rectangle class initiation parameters

        <b>Expected results:</b>
        Test passes if is_full_box method return expected bool value

        <b>Steps</b>
        1. Check positive scenario for is_full_box method: x1=y1=0, x2=y2=1
        2. Check negative scenarios for is_full_box method
        """
        full_box_rectangle_params = {"x1": 0.0, "y1": 0.0, "x2": 1.0, "y2": 1.0}
        # Positive scenario for Rectangle instance
        full_box_rectangle = Rectangle(**full_box_rectangle_params)
        assert Rectangle.is_full_box(full_box_rectangle)
        # Negative scenarios for Rectangle instance
        # Generating all scenarios when Rectangle object not a full_box
        keys_list = ["x1", "y1", "x2", "y2"]
        parameter_combinations = []
        for i in range(1, len(keys_list) + 1):
            parameter_combinations.append(list(itertools.combinations(keys_list, i)))
        # In each of scenario creating a copy of full_Box rectangle parameters and replacing to values from prepared
        # dictionary
        not_full_box_values_dict = {"x1": 0.01, "y1": 0.01, "x2": 0.9, "y2": 0.9}
        for combination in parameter_combinations:
            for scenario in combination:
                not_full_box_params = dict(full_box_rectangle_params)
                for key in scenario:
                    not_full_box_params[key] = not_full_box_values_dict.get(key)
                not_full_box_rectangle = Rectangle(**not_full_box_params)
                assert not Rectangle.is_full_box(not_full_box_rectangle), (
                    f"Expected False returned by is_full_box method for rectangle with parameters {not_full_box_params}"
                )
        # Negative scenario for not Rectangle class instance
        assert not Rectangle.is_full_box(str)

    def test_rectangle_crop_numpy_array(self):
        """
        <b>Description:</b>
        Check Rectangle crop_numpy_array method

        <b>Input data:</b>
        Rectangle class initiation parameters

        <b>Expected results:</b>
        Test passes if crop_numpy_array method return expected cropped array
        <b>Steps</b>
        1. Check crop_numpy_array method for Rectangle with parameters less than 0
        2. Check crop_numpy_array method for Rectangle with parameters range from 0 to 1
        3. Check crop_numpy_array method for Rectangle with parameters more than 1
        """
        image_height = image_width = 128
        numpy_image_array = np.random.uniform(low=0.0, high=255.0, size=(image_height, image_width, 3))
        scenarios = [
            {
                "input_params": {"x1": -0.2, "x2": -0.1, "y1": -0.3, "y2": -0.2},
                "cropped_expected": {"x1": 0, "y1": 0, "x2": 0, "y2": 0},
            },
            {
                "input_params": {"x1": 0.2, "x2": 0.3, "y1": 0.4, "y2": 0.8},
                "cropped_expected": {"x1": 26, "y1": 51, "x2": 38, "y2": 102},
            },
            {
                "input_params": {"x1": 1.1, "x2": 1.3, "y1": 1.1, "y2": 1.5},
                "cropped_expected": {"x1": 141, "y1": 141, "x2": 166, "y2": 192},
            },
        ]
        for rectangle_parameters in scenarios:
            with warnings.catch_warnings():
                warnings.filterwarnings("ignore", "Rectangle coordinates")
                rectangle = Rectangle(**rectangle_parameters.get("input_params"))
            expected_output = rectangle_parameters.get("cropped_expected")
            actual_cropped_image_array = rectangle.crop_numpy_array(numpy_image_array)
            expected_image_array = numpy_image_array[
                expected_output.get("y1") : expected_output.get("y2"),
                expected_output.get("x1") : expected_output.get("x2"),
                ::,
            ]
            assert actual_cropped_image_array.shape[2] == 3
            try:
                assert (expected_image_array == actual_cropped_image_array).all()
            except AttributeError:
                raise AssertionError("Unequal expected and cropped image arrays")

    def test_rectangle_width(self):
        """
        <b>Description:</b>
        Check Rectangle width method

        <b>Input data:</b>
        Instances of Rectangle class

        <b>Expected results:</b>
        Test passes if width method returns expected value of Rectangle width

        <b>Steps</b>
        1. Check width method for Rectangle instances
        """
        with warnings.catch_warnings():
            warnings.filterwarnings("ignore", "Rectangle coordinates")
            negative_x1_rectangle = Rectangle(x1=-0.3, y1=0.2, x2=0.7, y2=0.5)
        for rectangle, expected_width in [
            (self.horizontal_rectangle(), 0.30000000000000004),
            (self.vertical_rectangle(), 0.19999999999999998),
            (self.square(), 0.19999999999999998),
            (negative_x1_rectangle, 1.0),
        ]:
            assert rectangle.width == expected_width

    def test_rectangle_height(self):
        """
        <b>Description:</b>
        Check Rectangle height method

        <b>Input data:</b>
        Instances of Rectangle class

        <b>Expected results:</b>
        Test passes if height method returns expected value of Rectangle height

        <b>Steps</b>
        1. Check height method for Rectangle instances
        """
        with warnings.catch_warnings():
            warnings.filterwarnings("ignore", "Rectangle coordinates")
            negative_y1_rectangle = Rectangle(x1=0.3, y1=-0.4, x2=0.7, y2=0.5)
        for rectangle, expected_height in [
            (self.horizontal_rectangle(), 0.2),
            (self.vertical_rectangle(), 0.30000000000000004),
            (self.square(), 0.19999999999999998),
            (negative_y1_rectangle, 0.9),
        ]:
            assert rectangle.height == expected_height

    def test_rectangle_diagonal(self):
        """
        <b>Description:</b>
        Check Rectangle diagonal method

        <b>Input data:</b>
        Instances of Rectangle class

        <b>Expected results:</b>
        Test passes if diagonal method returns expected value of Rectangle diagonal

        <b>Steps</b>
        1. Check diagonal method for Rectangle instance
        """
        for rectangle, expected_diagonal in [
            (self.horizontal_rectangle(), 0.36055512754639896),
            (self.vertical_rectangle(), 0.36055512754639896),
            (self.square(), 0.282842712474619),
        ]:
            np.testing.assert_approx_equal(rectangle.diagonal, expected_diagonal)

    def test_rectangle_get_area(self):
        """
        <b>Description:</b>
        Check Rectangle get_area method

        <b>Input data:</b>
        Instances of Rectangle class

        <b>Expected results:</b>
        Test passes if get_area method returns expected value of Rectangle diagonal

        <b>Steps</b>
        1. Check get_area method for Rectangle instance
        """
        for rectangle, expected_area in [
            (self.horizontal_rectangle(), 0.06000000000000001),
            (self.vertical_rectangle(), 0.060000000000000005),
            (self.square(), 0.039999999999999994),
        ]:
            assert rectangle.get_area() == expected_area
