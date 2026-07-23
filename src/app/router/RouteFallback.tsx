import { Flex, Spin } from 'antd'

/** Заглушка на время подгрузки lazy-страницы. */
export function RouteFallback() {
  return (
    <Flex align="center" justify="center" style={{ minHeight: '60vh' }}>
      <Spin size="large" />
    </Flex>
  )
}
