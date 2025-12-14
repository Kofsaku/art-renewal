/**
 * 入退室履歴レポート JavaScript
 * 過去の入退室履歴データの検索・分析機能
 */
class HistoryReport {
    constructor() {
        this.currentFilters = {
            periodType: 'preset',
            startDate: null,
            endDate: null,
            dataDisplay: 'all'
        };
        this.historyData = [];
        this.filteredData = [];
        this.currentPage = 1;
        this.itemsPerPage = 30;
        this.columnOrder = ['occurredDate', 'personalCode', 'name', 'department', 'gateNumber', 'gateName', 'historyDetail'];
        this.hiddenColumns = [];
        this.excelFilters = {};
        this.draggedColumn = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeDates();
        this.loadHistoryData();
        this.updateTableHeaders();
        this.applyFiltersAndDisplay();
    }

    setupEventListeners() {
        // 期間選択のラジオボタン
        document.querySelectorAll('input[name="periodType"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.currentFilters.periodType = e.target.value;
                this.updateDateInputs();
                this.filterAndRenderData();
            });
        });

        // カレンダー表示切り替え
        document.getElementById('calendarToggle')?.addEventListener('click', () => {
            this.toggleCalendar();
        });

        // 日付入力
        document.getElementById('startDate')?.addEventListener('change', (e) => {
            this.currentFilters.startDate = e.target.value;
            this.filterAndRenderData();
        });

        document.getElementById('endDate')?.addEventListener('change', (e) => {
            this.currentFilters.endDate = e.target.value;
            this.updateDateRange(); // No.17
            this.filterAndRenderData();
        });

        // データ表示フィルター
        document.getElementById('dataDisplayFilter')?.addEventListener('change', (e) => {
            this.currentFilters.dataDisplay = e.target.value;
            this.filterAndRenderData();
        });

        // エクスポートボタン
        document.querySelector('.excel-export')?.addEventListener('click', () => {
            this.exportToExcel();
        });

        // カレンダーの日付クリック
        this.setupCalendarClickEvents();
        
        // Click outside to close Excel filters
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.excel-filter-trigger') && !e.target.closest('.excel-filter-menu')) {
                this.hideAllExcelFilters();
            }
        });
    }

    initializeDates() {
        const today = new Date();
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(today.getMonth() - 1);

        // デフォルト値を設定
        if (document.getElementById('startDate')) {
            document.getElementById('startDate').value = this.formatDateForInput(oneMonthAgo);
        }
        if (document.getElementById('endDate')) {
            document.getElementById('endDate').value = this.formatDateForInput(today);
        }

        this.currentFilters.startDate = this.formatDateForInput(oneMonthAgo);
        this.currentFilters.endDate = this.formatDateForInput(today);
    }

    updateDateInputs() {
        const today = new Date();
        let startDate, endDate;

        switch (this.currentFilters.periodType) {
            case 'preset': // 1ヶ月前
                startDate = new Date();
                startDate.setMonth(today.getMonth() - 1);
                endDate = today;
                break;
            case 'week': // 1週間前
                startDate = new Date();
                startDate.setDate(today.getDate() - 7);
                endDate = today;
                break;
            case 'year': // 1年前 (No.16)
                startDate = new Date();
                startDate.setFullYear(today.getFullYear() - 1);
                endDate = today;
                break;
            case 'day': // 1日前 (No.16)
                startDate = new Date();
                startDate.setDate(today.getDate() - 1);
                endDate = today;
                break;
            case 'custom': // カスタム
                // ユーザーが入力した値を保持
                return;
        }

        if (document.getElementById('startDate')) {
            document.getElementById('startDate').value = this.formatDateForInput(startDate);
            this.currentFilters.startDate = this.formatDateForInput(startDate);
        }
        if (document.getElementById('endDate')) {
            document.getElementById('endDate').value = this.formatDateForInput(endDate);
            this.currentFilters.endDate = this.formatDateForInput(endDate);
        }
    }

    toggleCalendar() {
        const calendar = document.getElementById('calendarPicker');
        if (calendar) {
            calendar.classList.toggle('show');
        }
    }

    setupCalendarClickEvents() {
        // カレンダーの日付セルにクリックイベントを追加
        const calendarCells = document.querySelectorAll('#calendarPicker td');
        calendarCells.forEach(cell => {
            if (cell.textContent.trim() && !isNaN(cell.textContent.trim())) {
                cell.style.cursor = 'pointer';
                cell.addEventListener('click', () => {
                    const day = cell.textContent.trim();
                    const selectedDate = `2025-09-${day.padStart(2, '0')}`;
                    
                    // 開始日を設定
                    if (document.getElementById('startDate')) {
                        document.getElementById('startDate').value = selectedDate;
                        this.currentFilters.startDate = selectedDate;
                    }
                    
                    // カスタム期間を選択
                    const customRadio = document.querySelector('input[name="periodType"][value="custom"]');
                    if (customRadio) {
                        customRadio.checked = true;
                        this.currentFilters.periodType = 'custom';
                    }
                    
                    this.filterAndRenderData();
                    this.toggleCalendar();
                });

                cell.addEventListener('mouseover', () => {
                    cell.style.backgroundColor = '#e3f2fd';
                });

                cell.addEventListener('mouseout', () => {
                    if (!cell.style.backgroundColor.includes('28a745')) {
                        cell.style.backgroundColor = '';
                    }
                });
            }
        });
    }

    loadHistoryData() {
        // デモ用データ生成
        const dataTypes = [
            { type: 'normal', remarks: ['入室', '退室'], class: 'row-normal' },
            { type: 'error', remarks: ['未登録エラー', 'カード読取エラー', 'ドア開放異常'], class: 'row-error' },
            { type: 'warning', remarks: ['バッテリー低下', '通信異常復旧'], class: 'row-warning' }
        ];

        const users = [
            { code: '000001', name: 'ユーザーA', department: '総務部' },
            { code: '000002', name: 'ユーザーB', department: '営業部' },
            { code: '000003', name: 'ユーザーC', department: 'システム部' },
            { code: '', name: '未登録ユーザー', department: '' }
        ];

        const gates = [
            { number: '0001', name: 'XA0001' },
            { number: '0002', name: 'XA0002' },
            { number: '0003', name: 'XA0003' },
            { number: '0004', name: 'XA0004' }
        ];

        // 過去1ヶ月分のデータを生成
        for (let i = 30; i >= 0; i--) {
            const dataType = dataTypes[Math.floor(Math.random() * dataTypes.length)];
            const user = dataType.type === 'error' ? users[3] : users[Math.floor(Math.random() * 3)];
            const gate = gates[Math.floor(Math.random() * gates.length)];
            const remark = dataType.remarks[Math.floor(Math.random() * dataType.remarks.length)];
            
            const baseTime = new Date();
            baseTime.setDate(baseTime.getDate() - i);
            baseTime.setHours(9 + Math.floor(Math.random() * 10));
            baseTime.setMinutes(Math.floor(Math.random() * 60));
            baseTime.setSeconds(Math.floor(Math.random() * 60));

            const data = {
                occurredDate: this.formatDateTime(baseTime),
                personalCode: user.code || '-',
                name: user.name,
                department: user.department || '',
                gateNumber: gate.number,
                gateName: gate.name,
                historyDetail: remark,
                statusClass: dataType.class,
                type: dataType.type,
                date: this.formatDateForInput(baseTime),
                timestamp: baseTime.getTime()
            };

            this.historyData.push(data);
        }

        // 時系列順に並び替え（新しいものが上）
        this.historyData.sort((a, b) => b.timestamp - a.timestamp);
    }

    updateTableHeaders() {
        const thead = document.querySelector('#tableHeaders');
        const columnDefinitions = {
            'occurredDate': { title: '発生日時', draggable: true },
            'personalCode': { title: '個人コード', draggable: true },
            'name': { title: '氏名', draggable: true },
            'department': { title: '所属', draggable: true },
            'gateNumber': { title: 'ゲート番号', draggable: true },
            'gateName': { title: 'ゲート名称', draggable: true },
            'historyDetail': { title: '履歴詳細', draggable: true }
        };
        
        thead.innerHTML = '';
        
        this.columnOrder.forEach(columnKey => {
            if (this.hiddenColumns.includes(columnKey)) return;
            
            const def = columnDefinitions[columnKey];
            if (!def) return;
            
            const th = document.createElement('th');
            th.setAttribute('data-column', columnKey);
            
            if (def.draggable) {
                th.setAttribute('draggable', 'true');
                th.addEventListener('dragstart', this.handleDragStart.bind(this));
                th.addEventListener('dragover', this.handleDragOver.bind(this));
                th.addEventListener('drop', this.handleDrop.bind(this));
                th.addEventListener('dragend', this.handleDragEnd.bind(this));
                
                th.innerHTML = `
                    <span class="column-visibility-toggle" onclick="historyReportInstance.toggleColumnVisibility('${columnKey}', event)" title="列表示切替">×</span>
                    ${def.title}
                    <div class="excel-filter-trigger" onclick="historyReportInstance.showExcelFilter(event, '${columnKey}')"></div>
                    <div class="excel-filter-menu" id="excel-filter-${columnKey}"></div>
                `;
            } else {
                th.innerHTML = def.title;
            }
            
            thead.appendChild(th);
        });
    }
    
    applyFiltersAndDisplay() {
        let data = [...this.historyData];
        
        // Period filter
        if (this.currentFilters.startDate && this.currentFilters.endDate) {
            data = data.filter(item => {
                return item.date >= this.currentFilters.startDate && 
                       item.date <= this.currentFilters.endDate;
            });
        }
        
        // Data display filter
        if (this.currentFilters.dataDisplay !== 'all') {
            data = data.filter(item => {
                switch (this.currentFilters.dataDisplay) {
                    case 'entry':
                        return item.historyDetail === '入室';
                    case 'exit':
                        return item.historyDetail === '退室';
                    case 'error':
                        return item.type === 'error';
                    default:
                        return true;
                }
            });
        }
        
        // Excel filters
        for (const [columnKey, filterValues] of Object.entries(this.excelFilters)) {
            if (!filterValues || filterValues.length === 0) continue;
            
            data = data.filter(item => {
                return filterValues.includes(item[columnKey]);
            });
        }
        
        this.filteredData = data;
        this.updatePagination();
        this.displayCurrentPage();
    }
    
    updatePagination() {
        const totalItems = this.filteredData.length;
        const totalPages = Math.ceil(totalItems / this.itemsPerPage);
        
        // Update page info
        const start = (this.currentPage - 1) * this.itemsPerPage + 1;
        const end = Math.min(this.currentPage * this.itemsPerPage, totalItems);
        document.getElementById('pageInfo').textContent = `${start}-${end} / ${totalItems}件中`;
        
        // Update pagination buttons
        const pagination = document.getElementById('pagination');
        pagination.innerHTML = '';
        
        // Previous button
        const prevButton = document.createElement('li');
        prevButton.className = `page-item ${this.currentPage === 1 ? 'disabled' : ''}`;
        prevButton.innerHTML = `<a class="page-link" href="#" onclick="historyReportInstance.changePage(${this.currentPage - 1})">前へ</a>`;
        pagination.appendChild(prevButton);
        
        // Page numbers
        const startPage = Math.max(1, this.currentPage - 2);
        const endPage = Math.min(totalPages, this.currentPage + 2);
        
        for (let i = startPage; i <= endPage; i++) {
            const pageButton = document.createElement('li');
            pageButton.className = `page-item ${i === this.currentPage ? 'active' : ''}`;
            pageButton.innerHTML = `<a class="page-link" href="#" onclick="historyReportInstance.changePage(${i})">${i}</a>`;
            pagination.appendChild(pageButton);
        }
        
        // Next button
        const nextButton = document.createElement('li');
        nextButton.className = `page-item ${this.currentPage === totalPages ? 'disabled' : ''}`;
        nextButton.innerHTML = `<a class="page-link" href="#" onclick="historyReportInstance.changePage(${this.currentPage + 1})">次へ</a>`;
        pagination.appendChild(nextButton);
    }
    
    displayCurrentPage() {
        const start = (this.currentPage - 1) * this.itemsPerPage;
        const end = start + this.itemsPerPage;
        const pageData = this.filteredData.slice(start, end);
        
        const tbody = document.getElementById('historyTableBody');
        tbody.innerHTML = '';
        
        pageData.forEach(row => {
            const tr = document.createElement('tr');
            tr.className = row.statusClass;
            
            this.columnOrder.forEach(columnKey => {
                if (this.hiddenColumns.includes(columnKey)) return;
                
                const td = document.createElement('td');
                td.textContent = row[columnKey] || '';
                tr.appendChild(td);
            });
            
            tbody.appendChild(tr);
        });
    }

    filterAndRenderData() {
        this.applyFiltersAndDisplay();
    }
    
    changePage(page) {
        const totalPages = Math.ceil(this.filteredData.length / this.itemsPerPage);
        if (page >= 1 && page <= totalPages) {
            this.currentPage = page;
            this.displayCurrentPage();
            this.updatePagination();
        }
    }

    exportToExcel() {
        // エクスポート機能のデモ（実際の実装では適切なライブラリを使用）
        alert('Excelファイルをエクスポートします。\n（実装時は適切なエクスポート処理を行います）');
    }

    formatDateTime(date) {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const seconds = date.getSeconds().toString().padStart(2, '0');
        
        return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
    }

    formatDateForInput(date) {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        
        return `${year}-${month}-${day}`;
    }
    
    // Excel filter methods
    showExcelFilter(event, columnKey) {
        event.stopPropagation();
        this.hideAllExcelFilters();
        
        const filterMenu = document.getElementById(`excel-filter-${columnKey}`);
        if (!filterMenu) return;
        
        // Get unique values for this column
        const uniqueValues = [...new Set(this.historyData.map(item => item[columnKey]))].sort();
        const currentFilterValues = this.excelFilters[columnKey] || [];
        const isFiltered = currentFilterValues.length > 0 && currentFilterValues.length < uniqueValues.length;
        
        filterMenu.innerHTML = `
            <div class="excel-filter-header">
                ${this.getColumnDisplayName(columnKey)} のフィルター
            </div>
            
            <div class="excel-search-section">
                <input type="text" class="excel-search-box" placeholder="検索テキストを入力" 
                       oninput="historyReportInstance.filterExcelOptions('${columnKey}', this.value)">
            </div>
            
            <div class="excel-filter-actions">
                <button class="excel-action-btn" onclick="historyReportInstance.selectAllExcelFilter('${columnKey}')">すべて選択</button>
                <button class="excel-action-btn" onclick="historyReportInstance.clearAllExcelFilter('${columnKey}')">すべてクリア</button>
                <button class="excel-action-btn primary" onclick="historyReportInstance.applyExcelFilter('${columnKey}')">OK</button>
            </div>
            
            <div class="excel-filter-list" id="excel-options-${columnKey}">
                <div class="excel-filter-item select-all" onclick="historyReportInstance.toggleExcelSelectAll('${columnKey}')">
                    <input type="checkbox" id="select-all-${columnKey}" ${!isFiltered ? 'checked' : ''}>
                    <span>（すべて選択）</span>
                </div>
                ${this.generateExcelFilterOptions(columnKey, uniqueValues, currentFilterValues)}
            </div>
            
            <div class="excel-filter-stats">
                ${uniqueValues.length}件中 ${currentFilterValues.length || uniqueValues.length}件を表示
            </div>
        `;
        
        filterMenu.classList.add('show');
    }
    
    generateExcelFilterOptions(columnKey, values, currentFilter) {
        return values.map(value => {
            const isChecked = currentFilter.length === 0 || currentFilter.includes(value);
            return `
                <div class="excel-filter-item" onclick="historyReportInstance.toggleExcelOption('${columnKey}', '${value}')">
                    <input type="checkbox" ${isChecked ? 'checked' : ''}>
                    <span>${value}</span>
                </div>
            `;
        }).join('');
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
            // No items selected, show none
            this.excelFilters[columnKey] = ['__NONE__'];
        } else {
            // Get all possible values
            const allValues = [...new Set(this.historyData.map(item => item[columnKey]))];
            
            if (selectedValues.length === allValues.length) {
                // All items selected, remove filter
                delete this.excelFilters[columnKey];
            } else {
                // Some items selected
                this.excelFilters[columnKey] = selectedValues;
            }
        }
        
        this.hideAllExcelFilters();
        this.applyFiltersAndDisplay();
    }
    
    hideAllExcelFilters() {
        document.querySelectorAll('.excel-filter-menu').forEach(menu => {
            menu.classList.remove('show');
        });
    }
    
    // Drag and drop methods
    handleDragStart(event) {
        const th = event.target.closest('th');
        if (!th || !th.draggable) return;
        
        this.draggedColumn = th;
        th.classList.add('dragging');
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/plain', th.dataset.column);
    }
    
    handleDragOver(event) {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
        
        const th = event.target.closest('th');
        if (th && th !== this.draggedColumn && th.draggable) {
            document.querySelectorAll('th.drag-over').forEach(header => header.classList.remove('drag-over'));
            th.classList.add('drag-over');
        }
    }
    
    handleDrop(event) {
        event.preventDefault();
        
        const targetTh = event.target.closest('th');
        if (!targetTh || !this.draggedColumn || targetTh === this.draggedColumn) {
            this.cleanupDragState();
            return;
        }
        
        const draggedColumnKey = this.draggedColumn.dataset.column;
        const targetColumnKey = targetTh.dataset.column;
        
        // Update column order array
        const draggedOrderIndex = this.columnOrder.indexOf(draggedColumnKey);
        const targetOrderIndex = this.columnOrder.indexOf(targetColumnKey);
        
        if (draggedOrderIndex !== -1 && targetOrderIndex !== -1) {
            this.columnOrder.splice(draggedOrderIndex, 1);
            const newTargetIndex = targetOrderIndex > draggedOrderIndex ? targetOrderIndex - 1 : targetOrderIndex;
            this.columnOrder.splice(newTargetIndex, 0, draggedColumnKey);
            
            this.updateTableHeaders();
            this.displayCurrentPage();
        }
        
        this.cleanupDragState();
    }
    
    handleDragEnd(event) {
        this.cleanupDragState();
    }
    
    cleanupDragState() {
        if (this.draggedColumn) {
            this.draggedColumn.classList.remove('dragging');
        }
        document.querySelectorAll('th.drag-over').forEach(th => th.classList.remove('drag-over'));
        this.draggedColumn = null;
    }
    
    toggleColumnVisibility(columnKey, event) {
        event.stopPropagation();
        
        if (this.hiddenColumns.includes(columnKey)) {
            this.hiddenColumns = this.hiddenColumns.filter(col => col !== columnKey);
        } else {
            this.hiddenColumns.push(columnKey);
        }
        
        this.updateTableHeaders();
        this.displayCurrentPage();
    }
    
    getColumnDisplayName(columnKey) {
        const names = {
            'occurredDate': '発生日時',
            'personalCode': '個人コード',
            'name': '氏名',
            'department': '所属',
            'gateNumber': 'ゲート番号',
            'gateName': 'ゲート名称',
            'historyDetail': '履歴詳細'
        };
        return names[columnKey] || columnKey;
    }
    
    // No.15: Extract data functionality
    extractData() {
        const selectedPeriod = this.currentFilters.periodType;
        const dataFilter = this.currentFilters.dataDisplay;
        
        let message = '抽出条件:\n';
        message += `期間: ${this.getPeriodDescription()}\n`;
        message += `データ: ${this.getDataFilterDescription(dataFilter)}\n`;
        message += `件数: ${this.filteredData.length}件`;
        
        if (confirm(message + '\n\nこの条件でデータを抽出しますか？')) {
            alert(`${this.filteredData.length}件のデータを抽出しました。`);
            // Here you would typically export or process the data
        }
    }
    
    // No.17: Update date range display
    updateDateRange() {
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;
        const display = document.getElementById('dateRangeDisplay');
        const actualPeriod = document.getElementById('actualPeriod');
        
        if (startDate && endDate && display && actualPeriod) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            const diffTime = Math.abs(end - start);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
            
            actualPeriod.textContent = `${this.formatDateJapanese(start)} 〜 ${this.formatDateJapanese(end)} (${diffDays}日間)`;
            display.style.display = 'block';
        } else if (display) {
            display.style.display = 'none';
        }
    }
    
    getPeriodDescription() {
        switch(this.currentFilters.periodType) {
            case 'preset': return '1ヶ月前';
            case 'week': return '1週間前';
            case 'year': return '1年前'; // No.16
            case 'day': return '1日前'; // No.16
            case 'custom': 
                const start = this.currentFilters.startDate;
                const end = this.currentFilters.endDate;
                if (start && end) {
                    return `${start} 〜 ${end}`;
                }
                return 'カスタム';
            default: return '未設定';
        }
    }
    
    getDataFilterDescription(filter) {
        switch(filter) {
            case 'all': return '全データ';
            case 'entry': return '入室のみ';
            case 'exit': return '退室のみ';
            case 'error': return 'エラーのみ';
            default: return '未設定';
        }
    }
    
    formatDateJapanese(date) {
        return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
    }
}

// Global instance and functions
let historyReportInstance;

// Change items per page
function changeItemsPerPage() {
    if (historyReportInstance) {
        historyReportInstance.itemsPerPage = parseInt(document.getElementById('itemsPerPage').value);
        historyReportInstance.currentPage = 1;
        historyReportInstance.applyFiltersAndDisplay();
    }
}

// Action functions
function applyFilters() {
    if (historyReportInstance) {
        historyReportInstance.applyFiltersAndDisplay();
    }
}

function resetAllFilters() {
    if (historyReportInstance) {
        historyReportInstance.excelFilters = {};
        historyReportInstance.currentFilters.dataDisplay = 'all';
        document.getElementById('dataDisplayFilter').value = 'all';
        historyReportInstance.hideAllExcelFilters();
        historyReportInstance.applyFiltersAndDisplay();
    }
}

function showColumnManager() {
    const modal = new bootstrap.Modal(document.getElementById('columnManagerModal'));
    modal.show();
}

function showAllColumns() {
    if (historyReportInstance) {
        historyReportInstance.hiddenColumns = [];
        historyReportInstance.updateTableHeaders();
        historyReportInstance.displayCurrentPage();
    }
}

function resetToDefault() {
    if (historyReportInstance) {
        historyReportInstance.columnOrder = ['occurredDate', 'personalCode', 'name', 'department', 'gateNumber', 'gateName', 'historyDetail'];
        historyReportInstance.hiddenColumns = [];
        historyReportInstance.updateTableHeaders();
        historyReportInstance.displayCurrentPage();
    }
}

function printReport() {
    alert('印刷機能を実行します');
}

// No.15: Extract data function
function extractData() {
    if (historyReportInstance) {
        historyReportInstance.extractData();
    }
}

// No.17: Update date range function
function updateDateRange() {
    if (historyReportInstance) {
        historyReportInstance.updateDateRange();
    }
}

// ページ読み込み時に初期化
document.addEventListener('DOMContentLoaded', () => {
    historyReportInstance = new HistoryReport();
});