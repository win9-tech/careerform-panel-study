import {notFound} from 'next/navigation';
import Admin from '../admin/view';
export const dynamic='force-dynamic';
export default function Preview(){
 if(process.env.NODE_ENV!=='development')notFound();
 const rows=[{id:'example-001',receivedAt:'2026-10-01T05:00:00Z',preference:'B',order:['A','B','C'],reason:'로딩바가 움직이니까 잘 진행되고 있다는 느낌이 들었어요.',trials:[{variant:'A',ratings:{comfort:3,trust:4,wait:3}},{variant:'B',ratings:{comfort:5,trust:5,wait:2}},{variant:'C',ratings:{comfort:4,trust:4,wait:3}}]},{id:'example-002',receivedAt:'2026-10-01T05:03:00Z',preference:'C',order:['C','A','B'],reason:'몇 개 남았는지 바로 보여서 기다리기 편했어요.',trials:[{variant:'C',ratings:{comfort:5,trust:4,wait:2}},{variant:'A',ratings:{comfort:3,trust:4,wait:3}},{variant:'B',ratings:{comfort:4,trust:4,wait:3}}]}];
 return <Admin previewRows={rows}/>;
}
