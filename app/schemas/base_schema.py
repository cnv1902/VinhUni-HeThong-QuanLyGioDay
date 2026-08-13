from pydantic import BaseModel, model_validator

class RoundedFloatBaseModel(BaseModel):
    """
    Schema gốc: Tự động rà soát và làm tròn toàn bộ các trường kiểu Float 
    về 2 chữ số thập phân trước khi xuất ra JSON.
    """
    @model_validator(mode='after')
    def round_all_floats(self) -> 'RoundedFloatBaseModel':
        for key, value in self.__dict__.items():
            if isinstance(value, float):
                setattr(self, key, round(value, 2))
        return self
