# Copyright (C) 2022-2025 Intel Corporation
# LIMITED EDGE SOFTWARE DISTRIBUTION LICENSE
from collections.abc import Callable

import pytest
from pymongo.command_cursor import CommandCursor
from pymongo.cursor import Cursor

from iai_core.entities.model_storage import ModelStorageIdentifier
from iai_core.entities.persistent_entity import PersistentEntity
from iai_core.repos.base import (
    DatasetStorageBasedSessionRepo,
    ModelStorageBasedSessionRepo,
    ProjectBasedSessionRepo,
    SessionBasedRepo,
)
from iai_core.repos.mappers.cursor_iterator import CursorIterator
from iai_core.repos.mappers.mongodb_mapper_interface import IMapperSimple
from iai_core.repos.mappers.mongodb_mappers.id_mapper import IDToMongo

from geti_types import ID, DatasetStorageIdentifier, ProjectIdentifier, Session


class Foo(PersistentEntity):
    def __init__(self, x: int, id_: ID = ID("foo")) -> None:
        super().__init__(id_=id_)
        self.x = x


class FooMapper(IMapperSimple[Foo, dict]):
    @staticmethod
    def forward(instance: Foo) -> dict:
        return {"_id": IDToMongo.forward(instance.id_), "x": instance.x}

    @staticmethod
    def backward(instance: dict) -> Foo:
        return Foo(x=instance["x"], id_=instance["_id"])


class ConcreteSessionRepo(SessionBasedRepo[Foo]):
    def __init__(self, session: Session) -> None:
        super().__init__(session=session, collection_name="test_session")

    @property
    def forward_map(self) -> Callable[[Foo], dict]:
        return FooMapper.forward

    @property
    def backward_map(self) -> Callable[[dict], Foo]:
        return FooMapper.backward

    @property
    def null_object(self) -> Foo:
        return Foo(x=0)

    @property
    def cursor_wrapper(self) -> Callable[[Cursor | CommandCursor], CursorIterator]:
        return lambda mongo_cursor: CursorIterator(cursor=mongo_cursor, mapper=FooMapper, parameter=None)


class ConcreteProjectBasedSessionRepo(ProjectBasedSessionRepo[Foo]):
    def __init__(self, session: Session, project_identifier: ProjectIdentifier) -> None:
        super().__init__(
            session=session,
            collection_name="test_proj_session",
            project_identifier=project_identifier,
        )

    @property
    def forward_map(self) -> Callable[[Foo], dict]:
        return FooMapper.forward

    @property
    def backward_map(self) -> Callable[[dict], Foo]:
        return FooMapper.backward

    @property
    def null_object(self) -> Foo:
        return Foo(x=0)

    @property
    def cursor_wrapper(self) -> Callable[[Cursor | CommandCursor], CursorIterator]:
        return lambda mongo_cursor: CursorIterator(cursor=mongo_cursor, mapper=FooMapper, parameter=None)


class ConcreteDatasetStorageBasedSessionRepo(DatasetStorageBasedSessionRepo[Foo]):
    def __init__(self, session: Session, dataset_storage_identifier: DatasetStorageIdentifier) -> None:
        super().__init__(
            session=session,
            collection_name="test_ds_session",
            dataset_storage_identifier=dataset_storage_identifier,
        )

    @property
    def forward_map(self) -> Callable[[Foo], dict]:
        return FooMapper.forward

    @property
    def backward_map(self) -> Callable[[dict], Foo]:
        return FooMapper.backward

    @property
    def null_object(self) -> Foo:
        return Foo(x=0)

    @property
    def cursor_wrapper(self) -> Callable[[Cursor | CommandCursor], CursorIterator]:
        return lambda mongo_cursor: CursorIterator(cursor=mongo_cursor, mapper=FooMapper, parameter=None)


class ConcreteModelStorageBasedSessionRepo(ModelStorageBasedSessionRepo[Foo]):
    def __init__(self, session: Session, model_storage_identifier: ModelStorageIdentifier) -> None:
        super().__init__(
            session=session,
            collection_name="test_ms_session",
            model_storage_identifier=model_storage_identifier,
        )

    @property
    def forward_map(self) -> Callable[[Foo], dict]:
        return FooMapper.forward

    @property
    def backward_map(self) -> Callable[[dict], Foo]:
        return FooMapper.backward

    @property
    def null_object(self) -> Foo:
        return Foo(x=0)

    @property
    def cursor_wrapper(self) -> Callable[[Cursor | CommandCursor], CursorIterator]:
        return lambda mongo_cursor: CursorIterator(cursor=mongo_cursor, mapper=FooMapper, parameter=None)


@pytest.fixture
def fxt_mappable_object():
    def _build_object(x: int, id_: ID = ID("foo")) -> Foo:
        return Foo(x=x, id_=id_)

    yield _build_object


@pytest.fixture
def fxt_mapper():
    return FooMapper


@pytest.fixture
def fxt_session_repo():
    def _build_repo(session: Session):
        repo = ConcreteSessionRepo(session=session)
        return repo

    yield _build_repo


@pytest.fixture
def fxt_project_based_session_repo():
    def _build_repo(session: Session, project_identifier: ProjectIdentifier) -> ConcreteProjectBasedSessionRepo:
        return ConcreteProjectBasedSessionRepo(
            session=session,
            project_identifier=project_identifier,
        )

    yield _build_repo


@pytest.fixture
def fxt_dataset_storage_based_session_repo():
    def _build_repo(
        session: Session, dataset_storage_identifier: DatasetStorageIdentifier
    ) -> ConcreteDatasetStorageBasedSessionRepo:
        return ConcreteDatasetStorageBasedSessionRepo(
            session=session,
            dataset_storage_identifier=dataset_storage_identifier,
        )

    yield _build_repo


@pytest.fixture
def fxt_model_storage_based_session_repo():
    def _build_repo(
        session: Session, model_storage_identifier: ModelStorageIdentifier
    ) -> ConcreteModelStorageBasedSessionRepo:
        return ConcreteModelStorageBasedSessionRepo(
            session=session,
            model_storage_identifier=model_storage_identifier,
        )

    yield _build_repo
