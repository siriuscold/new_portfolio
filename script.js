document.addEventListener('DOMContentLoaded', function() {
    const draggableItems = document.querySelectorAll('.draggable-item');
    const container = document.querySelector('.container');
    
    let activeItem = null;
    let startX = 0;
    let startY = 0;
    let currentX = 0;
    let currentY = 0;

    // Инициализация элементов: сохранение начального поворота и нормализация позиций
    draggableItems.forEach((item) => {
        // Извлекаем угол поворота из transform
        const computedStyle = window.getComputedStyle(item);
        const transform = computedStyle.transform || item.style.transform || '';
        const rotateMatch = item.style.transform.match(/rotate\(([^)]+)\)/);
        const rotation = rotateMatch ? rotateMatch[1] : '0deg';
        item.setAttribute('data-rotation', rotation);
        
        // Нормализуем начальную позицию - конвертируем в пиксели
        initializePosition(item);
        
        item.addEventListener('mousedown', dragStart);
        item.addEventListener('touchstart', dragStart, { passive: false });
    });

    function initializePosition(item) {
        // Используем двойной requestAnimationFrame чтобы убедиться, что элементы полностью отрендерены
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                const containerRect = container.getBoundingClientRect();
                const rotation = item.getAttribute('data-rotation') || '0deg';
                
                // Получаем реальную визуальную позицию элемента (учитывая все translate)
                const itemRect = item.getBoundingClientRect();
                const computedLeft = itemRect.left - containerRect.left;
                const computedTop = itemRect.top - containerRect.top;
                
                // Устанавливаем нормализованные позиции
                item.style.left = computedLeft + 'px';
                item.style.top = computedTop + 'px';
                item.style.right = 'auto';
                item.style.transform = `rotate(${rotation})`;
            });
        });
    }

    function dragStart(e) {
        activeItem = e.target.closest('.draggable-item');
        if (!activeItem) return;

        activeItem.classList.add('dragging');
        
        const containerRect = container.getBoundingClientRect();
        const itemRect = activeItem.getBoundingClientRect();
        
        // Текущая позиция элемента
        currentX = itemRect.left - containerRect.left;
        currentY = itemRect.top - containerRect.top;
        
        // Позиция курсора/тача
        if (e.type === 'touchstart') {
            startX = e.touches[0].clientX - currentX;
            startY = e.touches[0].clientY - currentY;
        } else {
            startX = e.clientX - currentX;
            startY = e.clientY - currentY;
        }

        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', dragEnd);
        document.addEventListener('touchmove', drag, { passive: false });
        document.addEventListener('touchend', dragEnd);
        
        e.preventDefault();
    }

    function drag(e) {
        if (!activeItem) return;

        e.preventDefault();

        // Вычисляем новую позицию
        if (e.type === 'touchmove') {
            currentX = e.touches[0].clientX - startX;
            currentY = e.touches[0].clientY - startY;
        } else {
            currentX = e.clientX - startX;
            currentY = e.clientY - startY;
        }

        // Ограничиваем перемещение границами контейнера
        const containerRect = container.getBoundingClientRect();
        const itemWidth = activeItem.offsetWidth;
        const itemHeight = activeItem.offsetHeight;

        const minX = 0;
        const maxX = containerRect.width - itemWidth;
        const minY = 0;
        const maxY = containerRect.height - itemHeight;

        currentX = Math.max(minX, Math.min(maxX, currentX));
        currentY = Math.max(minY, Math.min(maxY, currentY));

        // Обновляем позицию
        const rotation = activeItem.getAttribute('data-rotation') || '0deg';
        activeItem.style.left = currentX + 'px';
        activeItem.style.top = currentY + 'px';
        activeItem.style.right = 'auto';
        activeItem.style.transform = `rotate(${rotation})`;
    }

    function dragEnd() {
        if (activeItem) {
            activeItem.classList.remove('dragging');
            activeItem = null;
        }
        
        document.removeEventListener('mousemove', drag);
        document.removeEventListener('mouseup', dragEnd);
        document.removeEventListener('touchmove', drag);
        document.removeEventListener('touchend', dragEnd);
    }

    // Обработка изменения размера окна
    window.addEventListener('resize', function() {
        const containerRect = container.getBoundingClientRect();
        draggableItems.forEach(item => {
            const itemRect = item.getBoundingClientRect();
            const itemWidth = item.offsetWidth;
            const itemHeight = item.offsetHeight;
            
            let left = parseFloat(item.style.left) || 0;
            let top = parseFloat(item.style.top) || 0;
            
            // Проверяем границы и корректируем
            if (left < 0) left = 0;
            if (top < 0) top = 0;
            if (left + itemWidth > containerRect.width) left = containerRect.width - itemWidth;
            if (top + itemHeight > containerRect.height) top = containerRect.height - itemHeight;
            
            item.style.left = left + 'px';
            item.style.top = top + 'px';
        });
    });
});

