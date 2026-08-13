from pydantic import BaseModel, model_validator


def round_float_values(value):
    if isinstance(value, float):
        return round(value, 2)

    if isinstance(value, list):
        return [round_float_values(item) for item in value]

    if isinstance(value, dict):
        return {
            key: round_float_values(item)
            for key, item in value.items()
        }

    return value

class RoundedFloatBaseModel(BaseModel):
    """
    Schema gốc: Tự động rà soát và làm tròn toàn bộ các trường kiểu Float 
    về 2 chữ số thập phân trước khi xuất ra JSON.
    """
    @model_validator(mode='after')
    def round_all_floats(self) -> 'RoundedFloatBaseModel':
        for key, value in self.__dict__.items():
            setattr(self, key, round_float_values(value))
        return self
