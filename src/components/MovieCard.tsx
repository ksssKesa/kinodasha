'use client'

import Link from 'next/link'

interface MovieCardProps {
  movie: {
    id: string
    title: string
    year: string
    rating: number
    genre: string[]
    poster: string;
  }
}

/**
 * Карточка фильма
 * - загрузка изображения делается лениво (loading="lazy")
 * - обёртка <Link> сама по себе рендерит <a>, не добавляем лишнего <a> внутри
 */
export default function MovieCard({ movie }: MovieCardProps) {
  return (
    <Link
      href={`/movies/${movie.id}`}
      className="block bg-[#1e293b] rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
    >
      {/* Отступ-padding-bottom 56.25% (= 9/16), чтобы сохранить aspect-ratio */}
      <div className="relative aspect-[2/3] bg-gray-800 mb-2">
        <img 
          src={`/posters/${movie.poster}`}
          alt={movie.title}
          loading="lazy" 
          className="absolute inset-0 w-full h-full object-cover rounded"
        />
      </div>

      <div className="p-4">
        {/* Название + год */}
        <h2 className="font-bold mb-1 text-white">
          {movie.title}{' '}
          <span className="text-gray-400">({movie.year})</span>
        </h2>

        {/* Рейтинг */}
        <p className="text-gray-300">
          <span className="mr-1">★</span>
          {movie.rating.toFixed(1)}
        </p>
      </div>
    </Link>
  )
}