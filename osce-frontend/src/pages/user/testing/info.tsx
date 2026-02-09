const row = (title: string, discription: string) =>
    <div className="mb-[30px] text-osce-gray-4">
        <h4 className="mb-[20px] bloder">{title}</h4>
        <p className="text-osce-gray-3 font-[700]">{discription}</p>
    </div>
export default () => {
    return (
        <>
            {
                row("主訴", "我最近⼀個⽉，右上最後兩顆⼤⾅⿒刷牙的時候牙齦會流⾎，但這種症狀時有時無，已經持續 有⼀個⽉了，有去附近診所看過，醫師說我有牙周病，建議我到⼤醫院接受治 療。 但我不想拔牙。")
            }
            {
                row("本科病史", "右上的⼤⾅⿒之前有補過牙⿒，除此以外沒 有做過其他的治療，那個地⽅也沒有發⽣過外傷。 最近⼀次是在上個禮拜， 在家裡附近的診所看的，醫師幫我全⼝洗牙，並且告訴我有牙周病，建議到⼤醫院接受進⼀步的檢查與治療。")
            }
            {
                row("藥物病史", "我沒有吃⻄藥、中藥或避孕藥，只有偶⽽會吃⼀下維他命。")
            }
            {
                row("生活習慣", "右上的⼤⾅⿒之前有補過牙⿒，除此以外沒 有做過其他的治療，那個地⽅也沒有發⽣過外傷。")
            }
        </>
    )
}