import type {Metadata} from 'next';
import './globals.css';
export const metadata:Metadata={title:'커리어폼 화면 체험',description:'자동입력 대기 화면 비교 실험'};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="ko"><body>{children}</body></html>}
