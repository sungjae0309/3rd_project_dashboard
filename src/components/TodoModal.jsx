// src/components/TodoModal.jsx

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { FaTimes } from 'react-icons/fa';

const BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://192.168.101.51:8000';

export default function TodoModal({ darkMode, todo, onClose, onSave }) {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        priority: 'medium',
        category: '',
        due_date: new Date().toISOString().split('T')[0],
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (todo) {
            // 기존 할 일 수정 시, 데이터로 폼 채우기
            setFormData({
                title: todo.title || '',
                description: todo.description || '',
                priority: todo.priority || 'medium',
                category: todo.category || '',
                due_date: todo.due_date ? todo.due_date.split('T')[0] : new Date().toISOString().split('T')[0],
            });
        }
    }, [todo]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title) return alert("제목을 입력해주세요.");
        
        setLoading(true);
        const token = localStorage.getItem("accessToken");
        const headers = { Authorization: `Bearer ${token}` };
        
        // due_date를 ISO 8601 형식으로 변환 (시간은 정오로 설정)
        const submissionData = {
            ...formData,
            due_date: formData.due_date ? new Date(formData.due_date + 'T12:00:00').toISOString() : null
        };

        try {
            if (todo && todo.id) {
                // 할 일 수정 (PUT)
                await axios.put(`${BASE_URL}/todo-list/${todo.id}`, submissionData, { headers });
            } else {
                // 새 할 일 생성 (POST)
                await axios.post(`${BASE_URL}/todo-list/`, submissionData, { headers });
            }
            onSave(); // 성공 시 부모 컴포넌트에 알림
        } catch (err) {
            console.error("할 일 저장 실패:", err);
            alert("저장에 실패했습니다.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <ModalOverlay onClick={onClose}>
            <ModalCard onClick={e => e.stopPropagation()} $darkMode={darkMode}>
                <ModalHeader>
                    <h3>{todo ? '할 일 수정' : '새 할 일 추가'}</h3>
                    <CloseButton onClick={onClose}><FaTimes /></CloseButton>
                </ModalHeader>
                <Form onSubmit={handleSubmit}>
                    <InputGroup>
                        <Label>제목</Label>
                        <Input name="title" value={formData.title} onChange={handleChange} required />
                    </InputGroup>
                    <InputGroup>
                        <Label>설명</Label>
                        <Textarea name="description" value={formData.description} onChange={handleChange} rows="3" />
                    </InputGroup>
                    <Row>
                    <InputGroup>
                            <Label>마감일</Label>
                            <Input type="date" name="due_date" value={formData.due_date} onChange={handleChange} />
                        </InputGroup>
                        <InputGroup>
                            <Label>우선순위</Label>
                            <Select name="priority" value={formData.priority} onChange={handleChange}>
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                            </Select>
                        </InputGroup>
                    </Row> {/* <-- 올바르게 수정된 부분 */}
                    <InputGroup>
                        <Label>카테고리</Label>
                        <Input name="category" value={formData.category} onChange={handleChange} placeholder="예: 기술 학습" />
                    </InputGroup>
                    <SubmitButton type="submit" disabled={loading}>
                        {loading ? '저장 중...' : '저장하기'}
                    </SubmitButton>
                </Form>
            </ModalCard>
        </ModalOverlay>
    );
}

// Styled Components
const ModalOverlay = styled.div`
    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.5); z-index: 1000; display: flex;
    align-items: center; justify-content: center; backdrop-filter: blur(4px);
`;
const ModalCard = styled.div`
    background: ${({ $darkMode }) => $darkMode ? '#2a2a2a' : '#fff'};
    border-radius: 1rem; box-shadow: 0 10px 30px rgba(0,0,0,0.2);
    padding: 1.5rem 2rem; width: 100%; max-width: 500px;
`;
const ModalHeader = styled.div`
    display: flex; justify-content: space-between; align-items: center;
    margin-bottom: 1.5rem;
    h3 { margin: 0; font-size: 1.3rem; }
`;
const CloseButton = styled.button`
    background: none; border: none; font-size: 1.2rem; cursor: pointer;
    color: ${({ $darkMode }) => $darkMode ? '#888' : '#aaa'};
    &:hover { color: ${({ $darkMode }) => $darkMode ? '#fff' : '#000'}; }
`;
const Form = styled.form`
    display: flex; flex-direction: column; gap: 1rem;
`;
const InputGroup = styled.div`
    display: flex; flex-direction: column; gap: 0.5rem; flex: 1;
`;
const Label = styled.label`
    font-weight: 600; font-size: 0.9rem;
`;
const Input = styled.input`
    padding: 0.8rem; border: 1px solid ${({ $darkMode }) => $darkMode ? '#444' : '#ccc'};
    border-radius: 0.5rem; background: ${({ $darkMode }) => $darkMode ? '#333' : '#fff'};
    color: inherit; font-size: 1rem;
`;
const Textarea = styled.textarea`
    padding: 0.8rem; border: 1px solid ${({ $darkMode }) => $darkMode ? '#444' : '#ccc'};
    border-radius: 0.5rem; background: ${({ $darkMode }) => $darkMode ? '#333' : '#fff'};
    color: inherit; font-size: 1rem; resize: vertical;
`;
const Select = styled.select`
    padding: 0.8rem; border: 1px solid ${({ $darkMode }) => $darkMode ? '#444' : '#ccc'};
    border-radius: 0.5rem; background: ${({ $darkMode }) => $darkMode ? '#333' : '#fff'};
    color: inherit; font-size: 1rem;
`;
const Row = styled.div`
    display: flex; gap: 1rem;
`;
const SubmitButton = styled.button`
    padding: 0.8rem; background: #ffc107; color: #333;
    border: none; border-radius: 0.5rem; font-size: 1rem;
    font-weight: 600; cursor: pointer; margin-top: 1rem;
    &:disabled { background: #ccc; }
`;