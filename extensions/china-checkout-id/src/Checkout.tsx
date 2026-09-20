import {useState} from 'react';
import {
  reactExtension,
  Banner,
  BlockStack,
  TextField,
  useApplyAttributeChange,
  useShippingAddress,
} from '@shopify/ui-extensions-react/checkout';
import {validateChinaId} from './utils/validateId';

/** 写入订单 attributes 的 key（与 E2E 断言保持一致） */
const ID_ATTRIBUTE_KEY = '_China_National_ID';
const NAME_ATTRIBUTE_KEY = '_China_Real_Name';

const ID_ERROR_MESSAGE = '请输入合法的18位中国身份证号码';

export default reactExtension(
  'purchase.checkout.block.render',
  () => <ChinaIdCollector />,
);

function ChinaIdCollector() {
  const shippingAddress = useShippingAddress();
  const applyAttributeChange = useApplyAttributeChange();

  const [name, setName] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [idError, setIdError] = useState<string | undefined>(undefined);

  // 非中国收货地址：完全不渲染，做到对海外买家零视觉干扰。
  if (shippingAddress?.countryCode !== 'CN') {
    return null;
  }

  function handleNameChange(value: string) {
    setName(value);
    applyAttributeChange({
      type: 'updateAttribute',
      key: NAME_ATTRIBUTE_KEY,
      value,
    });
  }

  function handleIdChange(value: string) {
    setIdNumber(value);

    if (value.length === 0) {
      setIdError(undefined);
      return;
    }

    if (validateChinaId(value)) {
      setIdError(undefined);
      applyAttributeChange({
        type: 'updateAttribute',
        key: ID_ATTRIBUTE_KEY,
        value,
      });
    } else {
      setIdError(ID_ERROR_MESSAGE);
    }
  }

  return (
    <BlockStack spacing="loose">
      <Banner status="warning" title="中国海关清关要求">
        中国海关要求个人物品清关时提供真实有效的收件人身份信息。请填写收件人真实姓名及18位居民身份证号码。
      </Banner>
      <TextField
        label="收件人真实姓名（中文）"
        value={name}
        onChange={handleNameChange}
        autocomplete={false}
      />
      <TextField
        label="18位中国居民身份证号码"
        value={idNumber}
        onChange={handleIdChange}
        error={idError}
        maxLength={18}
        autocomplete={false}
      />
    </BlockStack>
  );
}
