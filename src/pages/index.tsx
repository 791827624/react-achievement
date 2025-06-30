import React from "react"
import { Link, useNavigate } from "react-router-dom";
import { HomeOutlined, LinkOutlined } from '@ant-design/icons';
import { Button, Card, Layout, Menu } from 'antd';



export const HomePage = () => {
    const navigate = useNavigate();
    const handleNavigate = () => {
        navigate('/keep-alive');
    };

    return (
        <Card title="首页">
            <Button
                type="primary"
                icon={<LinkOutlined />}
                onClick={() => navigate('/keep-alive')}
            >
                前往 Keep-Alive 页面
            </Button>
        </Card>
    );
}