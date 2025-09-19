/**
 * データモニター用JavaScript
 */
class DataMonitor {
    constructor() {
        this.isAutoScrollEnabled = true;
        this.dataBuffer = [];
        this.maxBufferSize = 500;
        this.currentFilters = {
            dataType: 'all',
            selectedGates: [],
            visibleColumns: ['occurredDate', 'personalCode', 'name', 'departmentName', 'gateNumber', 'gateName', 'remarks']
        };
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadInitialData();
        this.startAutoRefresh();
    }

    setupEventListeners() {
        // 自動スクロール停止/開始ボタン
        document.getElementById('toggleAutoScroll')?.addEventListener('click', () => {
            this.toggleAutoScroll();
        });

        // データ種別フィルタ
        document.getElementById('dataTypeFilter')?.addEventListener('change', (e) => {
            this.currentFilters.dataType = e.target.value;
            this.applyFilters();
        });

        // ゲートフィルタ
        document.querySelectorAll('.gate-filter-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.updateGateFilters();
            });
        });

        // 列表示/非表示フィルタ
        document.querySelectorAll('.column-filter-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.updateColumnVisibility();
            });
        });
    }

    loadInitialData() {
        // デモ用データ生成
        this.generateDemoData();
        this.renderTable();
    }

    generateDemoData() {
        const dataTypes = [
            { type: 'normal', color: 'normal', remarks: ['入室', '退室'] },
            { type: 'warning', color: 'warning', remarks: ['通信異常復旧', 'カードリーダー警告', 'バッテリー低下'] },
            { type: 'error', color: 'error', remarks: ['通信異常発生', 'ドア開放異常', 'セキュリティ違反'] },
            { type: 'info', color: 'info', remarks: ['システム開始', 'メンテナンス完了'] }
        ];

        const gates = [
            { number: '0001', name: 'XA0001', location: 'エントランス' },
            { number: '0002', name: 'XA0002', location: 'サーバールーム' },
            { number: '0003', name: 'XA0003', location: '会議室' },
            { number: '0004', name: 'XA0004', location: '役員室' }
        ];

        const departments = ['所属001', '所属002', '所属003', '管理部', '開発部'];

        // 過去30件のデータを生成
        for (let i = 30; i >= 1; i--) {
            const dataType = dataTypes[Math.floor(Math.random() * dataTypes.length)];
            const gate = gates[Math.floor(Math.random() * gates.length)];
            const remark = dataType.remarks[Math.floor(Math.random() * dataType.remarks.length)];
            
            const baseTime = new Date();
            baseTime.setMinutes(baseTime.getMinutes() - i * 2);

            const data = {
                occurredDate: this.formatDateTime(baseTime),
                personalCode: dataType.type === 'normal' ? String(Math.floor(Math.random() * 999) + 1).padStart(6, '0') : '',
                name: dataType.type === 'normal' ? `個人${String(Math.floor(Math.random() * 999) + 1).padStart(3, '0')}` : '',
                departmentName: dataType.type === 'normal' ? departments[Math.floor(Math.random() * departments.length)] : '',
                gateNumber: gate.number,
                gateName: dataType.type === 'normal' ? gate.name : `H = ${gate.number.substring(2)} A = ${Math.floor(Math.random() * 99) + 1}`,
                remarks: remark,
                statusClass: dataType.color,
                timestamp: baseTime.getTime()
            };

            this.dataBuffer.push(data);
        }
    }

    startAutoRefresh() {
        setInterval(() => {
            if (this.isAutoScrollEnabled) {
                this.addNewData();
            }
        }, 3000); // 3秒間隔で新データ追加
    }

    addNewData() {
        const dataTypes = [
            { type: 'normal', color: 'normal', remarks: ['入室', '退室'], probability: 0.7 },
            { type: 'warning', color: 'warning', remarks: ['通信異常復旧', 'カードリーダー警告'], probability: 0.2 },
            { type: 'error', color: 'error', remarks: ['通信異常発生', 'ドア開放異常'], probability: 0.1 }
        ];

        // 確率に基づいてデータタイプを選択
        const rand = Math.random();
        let selectedType = dataTypes[0];
        let cumulative = 0;
        for (const type of dataTypes) {
            cumulative += type.probability;
            if (rand <= cumulative) {
                selectedType = type;
                break;
            }
        }

        const gates = [
            { number: '0001', name: 'XA0001' },
            { number: '0002', name: 'XA0002' },
            { number: '0003', name: 'XA0003' },
            { number: '0004', name: 'XA0004' }
        ];

        const gate = gates[Math.floor(Math.random() * gates.length)];
        const remark = selectedType.remarks[Math.floor(Math.random() * selectedType.remarks.length)];
        const departments = ['所属001', '所属002', '所属003', '管理部', '開発部'];

        const newData = {
            occurredDate: this.formatDateTime(new Date()),
            personalCode: selectedType.type === 'normal' ? String(Math.floor(Math.random() * 999) + 1).padStart(6, '0') : '',
            name: selectedType.type === 'normal' ? `個人${String(Math.floor(Math.random() * 999) + 1).padStart(3, '0')}` : '',
            departmentName: selectedType.type === 'normal' ? departments[Math.floor(Math.random() * departments.length)] : '',
            gateNumber: gate.number,
            gateName: selectedType.type === 'normal' ? gate.name : `H = ${gate.number.substring(2)} A = ${Math.floor(Math.random() * 99) + 1}`,
            remarks: remark,
            statusClass: selectedType.color,
            timestamp: new Date().getTime()
        };

        // バッファーの先頭に追加（最新データが上に表示）
        this.dataBuffer.unshift(newData);

        // バッファーサイズ制限
        if (this.dataBuffer.length > this.maxBufferSize) {
            this.dataBuffer = this.dataBuffer.slice(0, this.maxBufferSize);
        }

        this.applyFilters();
    }

    toggleAutoScroll() {
        this.isAutoScrollEnabled = !this.isAutoScrollEnabled;
        const button = document.getElementById('toggleAutoScroll');
        if (button) {
            button.textContent = this.isAutoScrollEnabled ? '停止' : '開始';
            button.className = this.isAutoScrollEnabled ? 'btn btn-warning' : 'btn btn-success';
        }
    }

    updateGateFilters() {
        this.currentFilters.selectedGates = [];
        document.querySelectorAll('.gate-filter-checkbox:checked').forEach(checkbox => {
            this.currentFilters.selectedGates.push(checkbox.value);
        });
        this.applyFilters();
    }

    updateColumnVisibility() {
        this.currentFilters.visibleColumns = [];
        document.querySelectorAll('.column-filter-checkbox:checked').forEach(checkbox => {
            this.currentFilters.visibleColumns.push(checkbox.value);
        });
        this.renderTable();
    }

    applyFilters() {
        let filteredData = [...this.dataBuffer];

        // データ種別フィルタ
        if (this.currentFilters.dataType !== 'all') {
            filteredData = filteredData.filter(data => data.statusClass === this.currentFilters.dataType);
        }

        // ゲートフィルタ
        if (this.currentFilters.selectedGates.length > 0) {
            filteredData = filteredData.filter(data => 
                this.currentFilters.selectedGates.includes(data.gateNumber)
            );
        }

        this.renderTable(filteredData);
    }

    renderTable(data = null) {
        const tableBody = document.querySelector('.data-table tbody');
        if (!tableBody) return;

        const renderData = data || this.dataBuffer;
        
        // 表示件数制限（画面表示は30件まで）
        const displayData = renderData.slice(0, 30);

        tableBody.innerHTML = '';

        displayData.forEach(row => {
            const tr = document.createElement('tr');
            tr.className = `row-${row.statusClass}`;

            // 表示する列のみレンダリング
            const columns = [
                { key: 'occurredDate', html: `<span class="status-indicator status-${row.statusClass}"></span>${row.occurredDate}` },
                { key: 'personalCode', html: row.personalCode },
                { key: 'name', html: row.name },
                { key: 'departmentName', html: row.departmentName },
                { key: 'gateNumber', html: row.gateNumber },
                { key: 'gateName', html: row.gateName },
                { key: 'remarks', html: row.remarks }
            ];

            columns.forEach(col => {
                if (this.currentFilters.visibleColumns.includes(col.key)) {
                    const td = document.createElement('td');
                    td.innerHTML = col.html;
                    tr.appendChild(td);
                }
            });

            tableBody.appendChild(tr);
        });

        // ヘッダーの表示/非表示も更新
        this.updateTableHeaders();
    }

    updateTableHeaders() {
        const headers = document.querySelectorAll('.data-table th');
        const headerMapping = {
            0: 'occurredDate',
            1: 'personalCode', 
            2: 'name',
            3: 'departmentName',
            4: 'gateNumber',
            5: 'gateName',
            6: 'remarks'
        };

        headers.forEach((header, index) => {
            const columnKey = headerMapping[index];
            if (columnKey) {
                header.style.display = this.currentFilters.visibleColumns.includes(columnKey) ? '' : 'none';
            }
        });
    }

    formatDateTime(date) {
        return `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
    }
}

// ページ読み込み時に初期化
document.addEventListener('DOMContentLoaded', () => {
    new DataMonitor();
});