import React, { useMemo } from 'react';
import { Card, Space, Button, DatePicker, TimePicker, Typography, Radio } from 'antd';
import { CloseCircleOutlined, CalendarOutlined, ClockCircleOutlined, DesktopOutlined, TeamOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Text } = Typography;

const PlacesFilters = ({ filters, setFilters }) => {
  const tomorrow = useMemo(() => dayjs().add(1, 'day').startOf('day'), []);

  const hasChanges = useMemo(() => {
    const isNotTomorrow = filters.date ? !filters.date.isSame(tomorrow, 'day') : false;
    const hasTimeSelected = filters.timeRange !== null;
    const hasTypeFilter = filters.type && filters.type !== 'all';
    return isNotTomorrow || hasTimeSelected || hasTypeFilter;
  }, [filters.date, filters.timeRange, filters.type, tomorrow]);

  const handleReset = () => {
    setFilters(prev => ({
      ...prev,
      date: tomorrow,
      timeRange: null,
      type: 'all'
    }));
  };

  return (
    <Card 
      style={{ 
        background: '#141414', 
        borderColor: '#333', 
        borderRadius: '8px',
        marginBottom: '16px' 
      }} 
      bodyStyle={{ padding: '12px 24px' }}
    >
      <Space size="large" wrap>
        <Space direction="vertical" size={0}>
          <Text style={{ color: '#595959', fontSize: '10px', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>Тип зоны</Text>
          <Radio.Group 
            value={filters.type || 'all'} 
            onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
            optionType="button"
            buttonStyle="solid"
            size="middle"
          >
            <Radio.Button value="all" style={{ width: 60, textAlign: 'center' }}>Все</Radio.Button>
            <Radio.Button value="desk">
              <DesktopOutlined /> Места
            </Radio.Button>
            <Radio.Button value="meeting">
              <TeamOutlined /> Переговорные
            </Radio.Button>
          </Radio.Group>
        </Space>

        <Space direction="vertical" size={0}>
          <Text style={{ color: '#595959', fontSize: '10px', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>Дата</Text>
          <DatePicker 
            placeholder="Выбрать дату"
            value={filters.date}
            allowClear={false}
            inputReadOnly
            onChange={(date) => setFilters(prev => ({ ...prev, date: date.startOf('day') }))}
            disabledDate={(current) => current && current < dayjs().startOf('day')}
            style={{ width: 140 }}
            suffixIcon={<CalendarOutlined />}
          />
        </Space>

        <Space direction="vertical" size={0}>
          <Text style={{ color: '#595959', fontSize: '10px', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>Временной интервал</Text>
          <TimePicker.RangePicker 
            placeholder={['Начало', 'Конец']}
            value={filters.timeRange}
            format="HH:mm"
            minuteStep={15}
            // ГЛАВНОЕ ИЗМЕНЕНИЕ ТУТ:
            needConfirm={false} 
            onChange={(range) => setFilters(prev => ({ ...prev, timeRange: range }))}
            style={{ width: 180 }}
            suffixIcon={<ClockCircleOutlined />}
          />
        </Space>

        {hasChanges && (
          <Button 
            type="link" 
            danger 
            icon={<CloseCircleOutlined />}
            onClick={handleReset}
            style={{ 
              marginTop: '18px', 
              fontWeight: '500' 
            }}
          >
            Сбросить всё
          </Button>
        )}
      </Space>

      <style jsx="true">{`
        .ant-radio-button-wrapper {
          background: #1d1d1d !important;
          border-color: #333 !important;
          color: #8c8c8c !important;
        }
        .ant-radio-button-wrapper-checked:not(.ant-radio-button-wrapper-disabled) {
          background: #fadb14 !important;
          border-color: #fadb14 !important;
          color: #000 !important;
        }
        .ant-radio-button-wrapper:hover {
          color: #fadb14 !important;
        }
        /* Убираем футер с кнопкой OK, если он остался пустым */
        .ant-picker-footer {
          display: none !important;
        }
      `}</style>
    </Card>
  );
};

export default PlacesFilters;