import Image from 'next/image'

export default function Home() {
  return (
    <main >
        <label htmlFor="frameworks">Best ever framekors</label>
        <select name="fw" id="frameworks">
          <option value="next">Next</option>
          <option value="react">React</option>
        </select>
    </main>
  )
}
