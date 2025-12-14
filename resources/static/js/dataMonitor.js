/**
 * 入退室データモニター JavaScript
 * リアルタイムでの入退室履歴監視機能
 */
class DataMonitor {
    constructor() {
        this.isAutoScrollEnabled = true;
        this.dataBuffer = [];
        this.maxBufferSize = 500;
        this.currentFilters = {
            dataType: 'all',
            selectedGates: [],
            visibleColumns: ['occurredDate', 'personalCode', 'name', 'departmentCode', 'departmentName', 'gateNumber', 'gateName', 'historyDetails']
        };
        this.excelFilters = {};
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadInitialData();
        this.renderTable();
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
        
        // Close Excel filter menus when clicking outside (No.14)
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.excel-filter-trigger') && !e.target.closest('.excel-filter-menu')) {
                this.hideAllExcelFilters();
            }
        });
    }

    loadInitialData() {
        // デモ用データ生成
        this.generateDemoData();
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
        const departmentCodes = ['001', '002', '003', '004', '005'];

        // 過去30件のデータを生成
        for (let i = 30; i >= 1; i--) {
            const dataType = dataTypes[Math.floor(Math.random() * dataTypes.length)];
            const gate = gates[Math.floor(Math.random() * gates.length)];
            const remark = dataType.remarks[Math.floor(Math.random() * dataType.remarks.length)];
            
            const baseTime = new Date();
            baseTime.setMinutes(baseTime.getMinutes() - i * 2);

            const departmentIndex = Math.floor(Math.random() * departments.length);
            
            const data = {
                occurredDate: this.formatDateTime(baseTime),
                personalCode: dataType.type === 'normal' ? String(Math.floor(Math.random() * 999) + 1).padStart(6, '0') : '',
                name: dataType.type === 'normal' ? `個人${String(Math.floor(Math.random() * 999) + 1).padStart(3, '0')}` : '',
                departmentCode: dataType.type === 'normal' ? departmentCodes[departmentIndex] : '',
                departmentName: dataType.type === 'normal' ? departments[departmentIndex] : '',
                gateNumber: gate.number,
                gateName: dataType.type === 'normal' ? gate.name : `H = ${gate.number.substring(2)} A = ${Math.floor(Math.random() * 99) + 1}`,
                historyDetails: remark,
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
        const departmentCodes = ['001', '002', '003', '004', '005'];
        const departmentIndex = Math.floor(Math.random() * departments.length);

        const newData = {
            occurredDate: this.formatDateTime(new Date()),
            personalCode: selectedType.type === 'normal' ? String(Math.floor(Math.random() * 999) + 1).padStart(6, '0') : '',
            name: selectedType.type === 'normal' ? `個人${String(Math.floor(Math.random() * 999) + 1).padStart(3, '0')}` : '',
            departmentCode: selectedType.type === 'normal' ? departmentCodes[departmentIndex] : '',
            departmentName: selectedType.type === 'normal' ? departments[departmentIndex] : '',
            gateNumber: gate.number,
            gateName: selectedType.type === 'normal' ? gate.name : `H = ${gate.number.substring(2)} A = ${Math.floor(Math.random() * 99) + 1}`,
            historyDetails: remark,
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
        
        // Excel-like filters (No.14)
        for (const [columnKey, filterValues] of Object.entries(this.excelFilters)) {
            if (filterValues && filterValues.length > 0) {
                filteredData = filteredData.filter(data => {
                    if (filterValues.includes('__NONE__')) {
                        return false;
                    }
                    return filterValues.includes(data[columnKey]);
                });
            }
        }

        this.renderTable(filteredData);
        this.updateFilteredColumnHeaders();
    }

    renderTable(data = null) {
        const tableBody = document.querySelector('#dataTableBody');
        if (!tableBody) return;

        const renderData = data || this.dataBuffer;
        
        // 表示件数制限（画面表示は30件まで）
        const displayData = renderData.slice(0, 30);

        tableBody.innerHTML = '';

        displayData.forEach(row => {
            const tr = document.createElement('tr');
            tr.className = `row-${row.statusClass}`;

            // 表示する列のみレンダリング
            // 履歴詳細を強制的に確実に設定
            let historyDetailsValue = row.historyDetails;
            if (!historyDetailsValue || historyDetailsValue === '') {
                // 履歴詳細が空の場合、ステータスに応じてデフォルト値を設定
                if (row.statusClass === 'normal') {
                    historyDetailsValue = '入室';
                } else if (row.statusClass === 'warning') {
                    historyDetailsValue = 'バッテリー低下';
                } else if (row.statusClass === 'error') {
                    historyDetailsValue = '通信異常発生';
                } else {
                    historyDetailsValue = 'システム開始';
                }
            }
            
            const columns = [
                { key: 'occurredDate', html: `<span class="status-indicator status-${row.statusClass}"></span>${row.occurredDate}` },
                { key: 'personalCode', html: row.personalCode || '' },
                { key: 'name', html: row.name || '' },
                { key: 'departmentCode', html: row.departmentCode || '' },
                { key: 'departmentName', html: row.departmentName || '' },
                { key: 'gateNumber', html: row.gateNumber || '' },
                { key: 'gateName', html: row.gateName || '' },
                { key: 'historyDetails', html: historyDetailsValue }
            ];

            columns.forEach(col => {
                if (this.currentFilters.visibleColumns.includes(col.key)) {
                    const td = document.createElement('td');
                    
                    // 履歴詳細の場合は確実にデータを表示
                    if (col.key === 'historyDetails') {
                        td.innerHTML = historyDetailsValue;
                    } else {
                        td.innerHTML = col.html || '';
                    }
                    
                    tr.appendChild(td);
                }
            });

            tableBody.appendChild(tr);
        });

        // ヘッダーの表示/非表示も更新
        this.updateTableHeaders();
        this.updateFilterStatusDisplay();
    }
    
    // No.14: Excel-like filter functionality
    showDataFilter(event, columnKey) {
        event.stopPropagation();
        this.hideAllExcelFilters();
        
        const filterMenu = document.getElementById(`filter-${columnKey}`);
        if (!filterMenu) return;
        
        // Get unique values for this column
        const uniqueValues = [...new Set(this.dataBuffer.map(item => item[columnKey]))]
            .filter(val => val && val.toString().trim() !== '')
            .sort();
        
        const currentFilterValues = this.excelFilters[columnKey] || [];
        const isFiltered = currentFilterValues.length > 0 && currentFilterValues.length < uniqueValues.length;
        
        filterMenu.innerHTML = `
            <div class="excel-filter-header">
                ${this.getColumnDisplayName(columnKey)} のフィルター
            </div>
            
            <div class="excel-search-section">
                <input type="text" class="excel-search-box" placeholder="検索テキストを入力" 
                       oninput="dataMonitor.filterExcelOptions('${columnKey}', this.value)">
            </div>
            
            <div class="excel-filter-actions">
                <button class="excel-action-btn" onclick="dataMonitor.selectAllExcelFilter('${columnKey}')">すべて選択</button>
                <button class="excel-action-btn" onclick="dataMonitor.clearAllExcelFilter('${columnKey}')">すべてクリア</button>
                <button class="excel-action-btn primary" onclick="dataMonitor.applyExcelFilter('${columnKey}')">OK</button>
            </div>
            
            <div class="excel-filter-list" id="excel-options-${columnKey}">
                <div class="excel-filter-item select-all" onclick="dataMonitor.toggleExcelSelectAll('${columnKey}')">
                    <input type="checkbox" id="select-all-${columnKey}" ${!isFiltered ? 'checked' : ''}>
                    <span>（すべて選択）</span>
                </div>
                ${uniqueValues.map(value => {
                    const isChecked = currentFilterValues.length === 0 || currentFilterValues.includes(value);
                    return `
                        <div class="excel-filter-item" onclick="dataMonitor.toggleExcelOption('${columnKey}', '${value}')">
                            <input type="checkbox" ${isChecked ? 'checked' : ''}>
                            <span>${value}</span>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
        
        filterMenu.classList.add('show');
    }
    
    hideAllExcelFilters() {
        document.querySelectorAll('.excel-filter-menu').forEach(menu => {
            menu.classList.remove('show');
        });
    }
    
    toggleExcelSelectAll(columnKey) {
        const selectAllCheckbox = document.getElementById(`select-all-${columnKey}`);
        const allCheckboxes = document.querySelectorAll(`#excel-options-${columnKey} .excel-filter-item:not(.select-all) input[type="checkbox"]`);
        
        selectAllCheckbox.checked = !selectAllCheckbox.checked;
        
        allCheckboxes.forEach(checkbox => {
            checkbox.checked = selectAllCheckbox.checked;
        });
    }
    
    toggleExcelOption(columnKey, value) {
        const item = event.currentTarget;
        const checkbox = item.querySelector('input[type="checkbox"]');
        checkbox.checked = !checkbox.checked;
        
        this.updateExcelSelectAllState(columnKey);
    }
    
    updateExcelSelectAllState(columnKey) {
        const selectAllCheckbox = document.getElementById(`select-all-${columnKey}`);
        const allCheckboxes = document.querySelectorAll(`#excel-options-${columnKey} .excel-filter-item:not(.select-all) input[type="checkbox"]`);
        const checkedBoxes = document.querySelectorAll(`#excel-options-${columnKey} .excel-filter-item:not(.select-all) input[type="checkbox"]:checked`);
        
        if (checkedBoxes.length === 0) {
            selectAllCheckbox.checked = false;
            selectAllCheckbox.indeterminate = false;
        } else if (checkedBoxes.length === allCheckboxes.length) {
            selectAllCheckbox.checked = true;
            selectAllCheckbox.indeterminate = false;
        } else {
            selectAllCheckbox.checked = false;
            selectAllCheckbox.indeterminate = true;
        }
    }
    
    selectAllExcelFilter(columnKey) {
        const allCheckboxes = document.querySelectorAll(`#excel-options-${columnKey} input[type="checkbox"]`);
        allCheckboxes.forEach(checkbox => checkbox.checked = true);
    }
    
    clearAllExcelFilter(columnKey) {
        const allCheckboxes = document.querySelectorAll(`#excel-options-${columnKey} input[type="checkbox"]`);
        allCheckboxes.forEach(checkbox => checkbox.checked = false);
    }
    
    filterExcelOptions(columnKey, searchTerm) {
        const items = document.querySelectorAll(`#excel-options-${columnKey} .excel-filter-item:not(.select-all)`);
        items.forEach(item => {
            const text = item.textContent.toLowerCase();
            if (text.includes(searchTerm.toLowerCase())) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    }
    
    applyExcelFilter(columnKey) {
        const checkedItems = document.querySelectorAll(`#excel-options-${columnKey} .excel-filter-item:not(.select-all) input[type="checkbox"]:checked`);
        const selectedValues = Array.from(checkedItems).map(checkbox => {
            return checkbox.parentElement.querySelector('span').textContent;
        });
        
        if (selectedValues.length === 0) {
            this.excelFilters[columnKey] = ['__NONE__'];
        } else {
            const allValues = [...new Set(this.dataBuffer.map(item => item[columnKey]))]
                .filter(val => val && val.toString().trim() !== '');
            
            if (selectedValues.length === allValues.length) {
                delete this.excelFilters[columnKey];
            } else {
                this.excelFilters[columnKey] = selectedValues;
            }
        }
        
        this.hideAllExcelFilters();
        this.applyFilters();
    }
    
    updateFilteredColumnHeaders() {
        document.querySelectorAll('.data-table th').forEach(th => {
            th.classList.remove('filtered');
            const trigger = th.querySelector('.excel-filter-trigger');
            if (trigger) {
                trigger.classList.remove('active');
            }
        });
        
        for (const columnKey of Object.keys(this.excelFilters)) {
            const th = document.querySelector(`th[data-column="${columnKey}"]`);
            if (th) {
                th.classList.add('filtered');
                const trigger = th.querySelector('.excel-filter-trigger');
                if (trigger) {
                    trigger.classList.add('active');
                }
            }
        }
    }
    
    updateFilterStatusDisplay() {
        const hasFilters = Object.keys(this.excelFilters).length > 0 || 
                          this.currentFilters.dataType !== 'all' || 
                          this.currentFilters.selectedGates.length > 0;
        
        if (hasFilters) {
            const filterContainer = document.querySelector('.filter-panel');
            if (!document.querySelector('.filter-status-display')) {
                const statusDiv = document.createElement('div');
                statusDiv.className = 'filter-status-display';
                statusDiv.innerHTML = `
                    <span class="filter-active-badge">フィルター実行中 ▼</span>
                    <span class="filter-details" id="filterDetails"></span>
                `;
                filterContainer.parentNode.insertBefore(statusDiv, filterContainer.nextSibling);
            }
            
            this.updateFilterDetails();
        } else {
            const statusDisplay = document.querySelector('.filter-status-display');
            if (statusDisplay) {
                statusDisplay.remove();
            }
        }
    }
    
    updateFilterDetails() {
        const filterDetails = document.getElementById('filterDetails');
        if (!filterDetails) return;
        
        const descriptions = [];
        
        if (this.currentFilters.dataType !== 'all') {
            descriptions.push(`データ種別: ${this.currentFilters.dataType}`);
        }
        
        if (this.currentFilters.selectedGates.length > 0) {
            descriptions.push(`ゲート: ${this.currentFilters.selectedGates.join(', ')}`);
        }
        
        for (const [columnKey, filterValues] of Object.entries(this.excelFilters)) {
            if (filterValues && filterValues.length > 0) {
                const columnName = this.getColumnDisplayName(columnKey);
                descriptions.push(`${columnName}: ${filterValues.join(', ')}`);
            }
        }
        
        filterDetails.textContent = descriptions.join(' | ');
    }
    
    getColumnDisplayName(columnKey) {
        const names = {
            'occurredDate': '発生日付',
            'personalCode': '個人コード',
            'name': '氏名',
            'departmentCode': '所属コード',
            'departmentName': '所属名称',
            'gateNumber': 'ゲート番号',
            'gateName': 'ゲート名称',
            'historyDetails': '履歴詳細'
        };
        return names[columnKey] || columnKey;
    }

    updateTableHeaders() {
        const headers = document.querySelectorAll('.data-table th');
        const headerMapping = {
            0: 'occurredDate',
            1: 'personalCode', 
            2: 'name',
            3: 'departmentCode',
            4: 'departmentName',
            5: 'gateNumber',
            6: 'gateName',
            7: 'historyDetails'
        };

        headers.forEach((header, index) => {
            const columnKey = headerMapping[index];
            if (columnKey) {
                // 履歴詳細は常に表示、他の列は通常のフィルターチェック
                if (columnKey === 'historyDetails') {
                    header.style.display = '';
                } else {
                    header.style.display = this.currentFilters.visibleColumns.includes(columnKey) ? '' : 'none';
                }
            }
        });
    }

    formatDateTime(date) {
        return `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
    }
}

// Global variable for access from HTML
let dataMonitor;

// ページ読み込み時に初期化
document.addEventListener('DOMContentLoaded', () => {
    dataMonitor = new DataMonitor();
});

// Global functions for HTML onclick handlers (No.14)
function showDataFilter(event, columnKey) {
    if (dataMonitor) {
        dataMonitor.showDataFilter(event, columnKey);
    }
}