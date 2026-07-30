# from typing import Generic, TypeVar, Type
# from sqlalchemy.orm import Session

# ModelType = TypeVar("ModelType")

# class CRUDBase(Generic[ModelType]):
#     def __init__(self, model: Type[ModelType]):
#         self.model = model
#
#     def get(self, db: Session, id: int):
#         return db.query(self.model).filter(self.model.id == id).first()
