import React from 'react';
import { Tooltip, Spin, Tag } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { InfoCircleOutlined } from '@ant-design/icons';
import { workspaceApi } from '../../api/api';

const EquipmentTooltip = ({ workspaceId }) => {
  const { data, isLoading } = useQuery({
    queryKey: ['workspaceDetails', workspaceId],
    queryFn: () => workspaceApi.getWorkspaceDetails(workspaceId),
    enabled: false, // Не грузим сразу
    staleTime: 1000 * 60 * 10, // Кешируем на 10 минут
  });

  // Запускаем загрузку только при взаимодействии
  const handleMouseEnter = (query) => {
    if (!data) query.refetch();
  };

  const content = isLoading ? (
    <Spin size="small" />
  ) : (
    <div style={{ padding: '4px' }}>
      <div style={{ marginBottom: 8, fontWeight: 'bold' }}>Оснащение:</div>
      {data?.equipment?.length > 0 ? (
        data.equipment.map((item) => (
          <Tag key={item} color="gold" style={{ margin: '2px', fontSize: '10px' }}>
            {item}
          </Tag>
        ))
      ) : (
        <span>{data?.description || 'Описание отсутствует'}</span>
      )}
    </div>
  );

  return (
    <Tooltip 
      title={content} 
      onOpenChange={(open) => open && !data && handleMouseEnter({ refetch: () => {} })}
    >
      <InfoCircleOutlined 
        style={{ color: '#52c41a', cursor: 'help', fontSize: '16px' }} 
        onMouseEnter={() => !data && handleMouseEnter({ refetch: () => {} })}
      />
    </Tooltip>
  );
};

export default EquipmentTooltip;