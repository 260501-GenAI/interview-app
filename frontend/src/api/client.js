const API_BASE = '/api/v1';

/**
 * API client for the Interview Prep backend.
 */

async function request(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;

    const response = await fetch(url, {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        },
        ...options
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(error.detail || `Request failed: ${response.status}`);
    }

    return response.json();
}

// Materials
export async function uploadMaterial(file) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE}/materials/upload`, {
        method: 'POST',
        body: formData
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Upload failed' }));
        throw new Error(error.detail);
    }

    return response.json();
}

export async function listMaterials() {
    return request('/materials/list');
}

// Interview
export async function startInterview(topic, useMaterials = true) {
    return request('/interview/start', {
        method: 'POST',
        body: JSON.stringify({
            topic,
            use_materials: useMaterials
        })
    });
}

export async function getQuestion(threadId) {
    return request(`/interview/question?thread_id=${threadId}`);
}

export async function submitAnswer(threadId, transcript) {
    return request('/interview/answer', {
        method: 'POST',
        body: JSON.stringify({
            thread_id: threadId,
            transcript
        })
    });
}

export async function approveAssessment(threadId, action = 'approve') {
    return request(`/interview/approve?thread_id=${threadId}&action=${action}`, {
        method: 'POST'
    });
}

export async function getAssessment(threadId) {
    return request(`/interview/assessment?thread_id=${threadId}`);
}

export async function endSession(threadId) {
    return request(`/interview/${threadId}`, {
        method: 'DELETE'
    });
}
