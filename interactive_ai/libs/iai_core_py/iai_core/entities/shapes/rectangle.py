# Copyright (C) 2022-2025 Intel Corporation
# LIMITED EDGE SOFTWARE DISTRIBUTION LICENSE

"""This module implements the Rectangle shape entity."""

import datetime
import math
import warnings

import numpy as np
from shapely.geometry import Polygon as ShapelyPolygon

from iai_core.utils.time_utils import now

from .shape import Shape, ShapeType


class Rectangle(Shape):
    """Rectangle represents a rectangular shape.

    Rectangle are used to annotate detection and classification tasks. In the
    classification case, the rectangle is a full rectangle spanning the whole related
    item (could be an image, video frame, a region of interest).

    - x1 and y1 represent the top-left coordinate of the rectangle
    - x2 and y2 representing the bottom-right coordinate of the rectangle

    :param x1: x-coordinate of the top-left corner of the rectangle
    :param y1: y-coordinate of the top-left corner of the rectangle
    :param x2: x-coordinate of the bottom-right corner of the rectangle
    :param y2: y-coordinate of the bottom-right corner of the rectangle
    :param modification_date: Date of the last modification of the rectangle
    """

    def __init__(
        self,
        x1: float,
        y1: float,
        x2: float,
        y2: float,
        modification_date: datetime.datetime | None = None,
    ):
        modification_date = now() if modification_date is None else modification_date
        super().__init__(
            shape_type=ShapeType.RECTANGLE,
            modification_date=modification_date,
        )

        is_valid = True
        for x, y in [(x1, y1), (x2, y2)]:
            is_valid = is_valid and self._validate_coordinates(x, y)
        if not is_valid:
            warnings.warn(
                f"{type(self).__name__} coordinates are invalid : x1={x1}, y1={y1}, x2={x2}, y2={y2}",
                UserWarning,
            )

        self.x1 = x1
        self.y1 = y1
        self.x2 = x2
        self.y2 = y2
        if self.width <= 0 or self.height <= 0:
            raise ValueError(
                f"Invalid rectangle with coordinates: x1={self.x1}, y1={self.y1}, x2={self.x2}, y2={self.y2}"
            )

    def __repr__(self):
        """String representation of the rectangle."""
        return f"Rectangle(x={self.x1}, y={self.y1}, width={self.width}, height={self.height})"

    def __eq__(self, other: object):
        """Returns True if `other` is a `Rectangle` with the same coordinates."""
        if isinstance(other, Rectangle):
            return (
                self.x1 == other.x1
                and self.y1 == other.y1
                and self.x2 == other.x2
                and self.y2 == other.y2
                and self.modification_date == other.modification_date
            )
        return False

    def __hash__(self):
        """Returns hash of the rectangle."""
        return hash(str(self))

    def clip_to_visible_region(self) -> "Rectangle":
        """Clip the rectangle to the [0, 1] visible region of an image.

        :return: Rectangle: Clipped rectangle.
        """
        x1 = min(max(0.0, self.x1), 1.0)
        y1 = min(max(0.0, self.y1), 1.0)
        x2 = min(max(0.0, self.x2), 1.0)
        y2 = min(max(0.0, self.y2), 1.0)

        return Rectangle(x1=x1, y1=y1, x2=x2, y2=y2, modification_date=self.modification_date)

    def normalize_wrt_roi_shape(self, roi_shape: Shape) -> "Rectangle":
        """Transforms from the `roi` coordinate system to the normalized coordinate system.

        Example:
            Assume we have rectangle `b1` which lives in the top-right quarter of
            a 2D space. The 2D space where `b1` lives in is an `roi` living in the top-left
            quarter of the normalized coordinate space. This function returns rectangle
            `b1` expressed in the normalized coordinate space.

                >>> from iai_core.entities.annotation import Annotation
                >>> b1 = Rectangle(x1=0.5, x2=1.0, y1=0.0, y2=0.5)
                >>> roi = Rectangle(x1=0.0, x2=0.5, y1=0.0, y2=0.5)
                >>> normalized = b1.normalize_wrt_roi_shape(roi_shape)
                >>> normalized
                Box(, x=0.25, y=0.0, width=0.25, height=0.25)

        :param roi_shape: Region of Interest.

        :raises ValueError: If the `roi_shape` is not a `Rectangle`.

        :return: New polygon in the image coordinate system
        """
        if not isinstance(roi_shape, Rectangle):
            raise ValueError("roi_shape has to be a Rectangle.")

        roi_shape = roi_shape.clip_to_visible_region()

        return Rectangle(
            x1=self.x1 * roi_shape.width + roi_shape.x1,
            y1=self.y1 * roi_shape.height + roi_shape.y1,
            x2=self.x2 * roi_shape.width + roi_shape.x1,
            y2=self.y2 * roi_shape.height + roi_shape.y1,
            modification_date=self.modification_date,
        )

    def denormalize_wrt_roi_shape(self, roi_shape: Shape) -> "Rectangle":
        """Transforming shape from the normalized coordinate system to the `roi` coordinate system.

        Example:

            Assume we have rectangle `b1` which lives in the top-right quarter of
            the normalized coordinate space. The `roi` is a rectangle living in the half
            right of the normalized coordinate space. This function returns rectangle
            `b1` expressed in the coordinate space of `roi`. (should return top-half)
            Box denormalized to a rectangle as ROI

                >>> from iai_core.entities.annotation import Annotation
                >>> b1 = Rectangle(x1=0.5, x2=1.0, y1=0.0, y2=0.5)
                # the top-right
                >>> roi = Annotation(Rectangle(x1=0.5, x2=1.0, y1=0.0, y2=1.0))
                # the half-right
                >>> normalized = b1.denormalize_wrt_roi_shape(roi_shape)
                # should return top half
                >>> normalized
                Box(, x=0.0, y=0.0, width=1.0, height=0.5)

        :param roi_shape: Region of Interest

        :raises ValueError: If the `roi_shape` is not a `Rectangle`.

        :return: Rectangle: New polygon in the ROI coordinate system
        """
        if not isinstance(roi_shape, Rectangle):
            raise ValueError("roi_shape has to be a Rectangle.")

        roi_shape = roi_shape.clip_to_visible_region()

        x1 = (self.x1 - roi_shape.x1) / roi_shape.width
        y1 = (self.y1 - roi_shape.y1) / roi_shape.height
        x2 = (self.x2 - roi_shape.x1) / roi_shape.width
        y2 = (self.y2 - roi_shape.y1) / roi_shape.height

        return Rectangle(
            x1=x1,
            y1=y1,
            x2=x2,
            y2=y2,
            modification_date=self.modification_date,
        )

    def _as_shapely_polygon(self) -> ShapelyPolygon:
        points = [
            (self.x1, self.y1),
            (self.x2, self.y1),
            (self.x2, self.y2),
            (self.x1, self.y2),
            (self.x1, self.y1),
        ]
        return ShapelyPolygon(points)

    @classmethod
    def generate_full_box(cls) -> "Rectangle":
        """Returns a rectangle that fully encapsulates the normalized coordinate space.

        Example:
            >>> Rectangle.generate_full_box()
            Box(, x=0.0, y=0.0, width=1.0, height=1.0)

        :return: Rectangle: A rectangle that fully encapsulates the normalized coordinate space.
        """
        return cls(x1=0.0, y1=0.0, x2=1.0, y2=1.0)

    @staticmethod
    def is_full_box(rectangle: Shape) -> bool:
        """Returns true if rectangle is a full box (occupying the full normalized coordinate space).

        Example:

            >>> b1 = Rectangle(x1=0.5, x2=1.0, y1=0.0, y2=1.0)
            >>> Rectangle.is_full_box(b1)
            False

            >>> b2 = Rectangle(x1=0.0, x2=1.0, y1=0.0, y2=1.0)
            >>> Rectangle.is_full_box(b2)
            True

        :param rectangle: rectangle to evaluate

        :return: bool: true if it fully encapsulate normalized coordinate space.
        """
        return (
            isinstance(rectangle, Rectangle)
            and rectangle.x1 == 0
            and rectangle.y1 == 0
            and rectangle.height == 1
            and rectangle.width == 1
        )

    def crop_numpy_array(self, data: np.ndarray) -> np.ndarray:
        """Crop the given Numpy array to the region of interest represented by this rectangle.

        :param data: Image to crop.

        :return: np.ndarray: Cropped image.
        """

        # We clip negative values to zero since Numpy uses negative values
        # to represent indexing from the right side of the array.
        # However, on the other hand, it is safe to have indices larger than the size
        # of the dimension; therefore, we do not clip values larger than the width and
        # height.
        x1 = max(int(round(self.x1 * data.shape[1])), 0)
        x2 = max(int(round(self.x2 * data.shape[1])), 0)
        y1 = max(int(round(self.y1 * data.shape[0])), 0)
        y2 = max(int(round(self.y2 * data.shape[0])), 0)

        return data[y1:y2, x1:x2, ::]

    @property
    def width(self) -> float:
        """Returns the width of the rectangle (x-axis).

        Example:

            >>> b1 = Rectangle(x1=0.5, x2=1.0, y1=0.0, y2=0.5)
            >>> b1.width
            0.5

        :return: float: the width of the rectangle. (x-axis)
        """
        return self.x2 - self.x1

    @property
    def height(self) -> float:
        """Returns the height of the rectangle (y-axis).

        Example:

            >>> b1 = Rectangle(x1=0.5, x2=1.0, y1=0.0, y2=0.5)
            >>> b1.height
            0.5

        :return: float: the height of the rectangle. (y-axis)
        """
        return self.y2 - self.y1

    @property
    def diagonal(self) -> float:
        """Returns the diagonal size/hypotenuse  of the rectangle (x-axis).

        Example:

            >>> b1 = Rectangle(x1=0.0, x2=0.3, y1=0.0, y2=0.4)
            >>> b1.diagonal
            0.5

        :return: float: the width of the rectangle. (x-axis)
        """
        return math.hypot(self.width, self.height)

    def get_area(self) -> float:
        """Computes the approximate area of the shape.

        Area is a value between 0 and 1, calculated as (x2-x1) * (y2-y1)

        NOTE: This method should not be relied on for exact area computation. The area
        is approximate, because shapes are continuous, but pixels are discrete.

        Example:
            >>> Rectangle(0, 0, 1, 1).get_area()
            1.0
            >>> Rectangle(0.5, 0.5, 1.0, 1.0).get_area()
            0.25

        :return: float: Approximate area of the shape.
        """
        return (self.x2 - self.x1) * (self.y2 - self.y1)
