export const getLanguageIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();

    switch (extension) {
        case 'js':
            return { abbr: 'JS', color: 'text-yellow-500' };
        case 'ts':
            return { abbr: 'TS', color: 'text-blue-500' };
        case 'py':
            return { abbr: 'PY', color: 'text-green-500' };
        case 'java':
            return { abbr: 'JV', color: 'text-red-500' };
        case 'cpp':
            return { abbr: 'C++', color: 'text-blue-400' };
        case 'c':
            return { abbr: 'C', color: 'text-blue-400' };
        case 'html':
            return { abbr: 'HT', color: 'text-orange-500' };
        case 'css':
            return { abbr: 'CS', color: 'text-blue-300' };
        default:
            return { abbr: '??', color: 'text-gray-400' };
    }
}; 